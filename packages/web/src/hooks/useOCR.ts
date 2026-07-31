import { useCallback } from "react";
import { useOCRStore } from "@/stores/ocrStore";
import { useAreaStore } from "@/stores/areaStore";
import { useDocumentStore } from "@/stores/documentStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { getAreaImage } from "@/stores/imageStore";
import { ocrExtract, saveExtraction } from "@/services/api";
import i18n from "@/i18n";
import type { Area } from "@/types/area";
import type { AppSettings } from "@/types/settings";
import type { DocumentFile } from "@/types/document";

const OCR_TIMEOUT_MS = 60000;
const DEBUG_OCR = true;

function dataUrlToJpegDataUrl(dataUrl: string, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get 2d context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

export interface ExtractionDeps {
  getSettings: () => AppSettings;
  getDocument: () => DocumentFile | null;
  getActiveArea: () => Area | null;
  updateAreaStatus: (id: string, status: Area["status"], error?: string) => void;
  updateAreaExtractedText: (id: string, text: string) => void;
  setProcessing: (b: boolean) => void;
  setAbortController: (c: AbortController | null) => void;
  ocrExtract: (
    imageBase64: string,
    model?: string,
    signal?: AbortSignal
  ) => Promise<{ text: string; provider: string }>;
  saveExtraction: (data: {
    documentName: string;
    areaName: string;
    pageIndex: number;
    zone: { x: number; y: number; width: number; height: number };
    extractedText: string;
    provider: string;
  }) => Promise<void>;
  dataUrlToJpegDataUrl: (dataUrl: string, quality: number) => Promise<string>;
  getAreaImage: (id: string, kind: "raw" | "processed") => string | null;
  getTimeoutMessage: () => string;
  timeoutMs: number;
  debug: boolean;
}

export type ExtractionOutcome = {
  status: Area["status"] | null;
  reason: "success" | "error" | "cancelled" | "timeout" | "skipped";
};

export async function runExtraction(deps: ExtractionDeps): Promise<ExtractionOutcome> {
  const {
    getSettings,
    getDocument,
    getActiveArea,
    updateAreaStatus,
    updateAreaExtractedText,
    setProcessing,
    setAbortController,
    ocrExtract: doOcrExtract,
    saveExtraction: doSaveExtraction,
    dataUrlToJpegDataUrl: convertImage,
    getAreaImage: getImage,
    getTimeoutMessage,
    timeoutMs,
    debug,
  } = deps;

  const settings = getSettings();
  const doc = getDocument();

  if (!settings.ocrEnabled || !doc) {
    return { status: null, reason: "skipped" };
  }

  const area = getActiveArea();
  if (!area || !area.zone) {
    return { status: null, reason: "skipped" };
  }

  const abortController = new AbortController();
  setAbortController(abortController);
  const signal = abortController.signal;

  const timeoutId = setTimeout(() => {
    abortController.abort(
      new DOMException("OCR request timed out", "TimeoutError")
    );
  }, timeoutMs);

  updateAreaStatus(area.id, "processing");
  setProcessing(true);

  let wasCancelled = false;
  let wasTimeout = false;
  let finalStatus: Area["status"] | null = null;
  let finalReason: ExtractionOutcome["reason"] = "success";

  try {
    const processedDataUrl = getImage(area.id, "processed") ?? getImage(area.id, "raw");
    if (!processedDataUrl) {
      updateAreaStatus(area.id, "error", "No crop image available");
      finalStatus = "error";
      finalReason = "error";
      return { status: finalStatus, reason: finalReason };
    }

    if (debug) {
      const sizeKB = (new Blob([processedDataUrl]).size / 1024).toFixed(1);
      console.log(`[OCR] Source image size: ${sizeKB} KB`);
    }

    if (signal.aborted) {
      wasCancelled = true;
      if (signal.reason instanceof DOMException && signal.reason.name === "TimeoutError") {
        wasTimeout = true;
      }
      return { status: finalStatus, reason: wasTimeout ? "timeout" : "cancelled" };
    }

    const ocrPayload = await convertImage(processedDataUrl, 0.85);

    if (debug) console.log(`[OCR] Sending request to backend...`);
    const response = await doOcrExtract(ocrPayload, settings.ocrModel, signal);

    if (signal.aborted) {
      wasCancelled = true;
      if (signal.reason instanceof DOMException && signal.reason.name === "TimeoutError") {
        wasTimeout = true;
      }
      return { status: finalStatus, reason: wasTimeout ? "timeout" : "cancelled" };
    }

    const cleanText = response.text.trim();

    updateAreaExtractedText(area.id, cleanText);

    await doSaveExtraction({
      documentName: doc.name,
      areaName: area.name,
      pageIndex: area.pageIndex,
      zone: area.zone,
      extractedText: cleanText,
      provider: response.provider,
    });

    updateAreaStatus(area.id, "extracted");
    finalStatus = "extracted";
    finalReason = "success";
    return { status: finalStatus, reason: finalReason };
  } catch (err) {
    if (debug) {
      const errName = err instanceof Error ? err.name : "Unknown";
      const errMsg = err instanceof Error ? err.message : String(err);
      console.log(`[OCR] ERROR - ${errName}: ${errMsg}`);
    }
    if (err instanceof DOMException && err.name === "TimeoutError") {
      wasCancelled = true;
      wasTimeout = true;
      return { status: null, reason: "timeout" };
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      wasCancelled = true;
      if (signal.reason instanceof DOMException && signal.reason.name === "TimeoutError") {
        wasTimeout = true;
      }
      return { status: null, reason: wasTimeout ? "timeout" : "cancelled" };
    }
    if (signal.aborted) {
      wasCancelled = true;
      if (signal.reason instanceof DOMException && signal.reason.name === "TimeoutError") {
        wasTimeout = true;
      }
      return { status: null, reason: wasTimeout ? "timeout" : "cancelled" };
    }
    updateAreaStatus(
      area.id,
      "error",
      err instanceof Error ? err.message : "Unknown error"
    );
    finalStatus = "error";
    finalReason = "error";
    return { status: finalStatus, reason: finalReason };
  } finally {
    clearTimeout(timeoutId);
    if (wasTimeout) {
      updateAreaStatus(area.id, "error", getTimeoutMessage());
      finalStatus = "error";
      finalReason = "timeout";
    } else if (wasCancelled) {
      updateAreaStatus(area.id, "zone-defined");
      finalStatus = "zone-defined";
      finalReason = "cancelled";
    }
    setProcessing(false);
    setAbortController(null);
  }
}

export function useOCR() {
  const { isProcessing, setProcessing, setAbortController } = useOCRStore();

  const extractActive = useCallback(async () => {
    const { updateAreaStatus, updateAreaExtractedText, getActiveArea } =
      useAreaStore.getState();

    if (DEBUG_OCR) console.log(`[OCR] Starting extraction...`);

    return runExtraction({
      getSettings: () => useSettingsStore.getState().settings,
      getDocument: () => useDocumentStore.getState().document,
      getActiveArea,
      updateAreaStatus,
      updateAreaExtractedText,
      setProcessing,
      setAbortController,
      ocrExtract,
      saveExtraction,
      dataUrlToJpegDataUrl,
      getAreaImage,
      getTimeoutMessage: () => i18n.t("ocr.timeout"),
      timeoutMs: OCR_TIMEOUT_MS,
      debug: DEBUG_OCR,
    });
  }, [setProcessing, setAbortController]);

  return { extractActive, isProcessing };
}
