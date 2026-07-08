import { useCallback } from "react";
import { useOCRStore } from "@/stores/ocrStore";
import { useAreaStore } from "@/stores/areaStore";
import { useDocumentStore } from "@/stores/documentStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { getAreaImage } from "@/stores/imageStore";
import { ocrExtract, saveExtraction } from "@/services/api";
import i18n from "@/i18n";

const OCR_TIMEOUT_MS = 30000;

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

export function useOCR() {
  const { isProcessing, setProcessing, setAbortController } = useOCRStore();

  const extractActive = useCallback(async () => {
    const { settings } = useSettingsStore.getState();
    const { document: doc } = useDocumentStore.getState();
    const { getActiveArea, updateAreaStatus, updateAreaExtractedText } =
      useAreaStore.getState();

    if (!settings.ocrEnabled || !doc) return;

    const area = getActiveArea();
    if (!area || !area.zone) return;

    const abortController = new AbortController();
    setAbortController(abortController);
    const signal = abortController.signal;

    const timeoutId = setTimeout(() => {
      abortController.abort(
        new DOMException("OCR request timed out", "TimeoutError")
      );
    }, OCR_TIMEOUT_MS);

    updateAreaStatus(area.id, "processing");
    setProcessing(true);

    let wasCancelled = false;
    let wasTimeout = false;

    try {
      const processedDataUrl = getAreaImage(area.id, "processed") ?? getAreaImage(area.id, "raw");
      if (!processedDataUrl) {
        updateAreaStatus(area.id, "error", "No crop image available");
        return;
      }

      if (signal.aborted) {
        wasCancelled = true;
        if (signal.reason instanceof DOMException && signal.reason.name === "TimeoutError") {
          wasTimeout = true;
        }
        return;
      }

      const ocrPayload = await dataUrlToJpegDataUrl(processedDataUrl, 0.85);

      const response = await ocrExtract(ocrPayload, settings.apiKey || undefined, signal);

      if (signal.aborted) {
        wasCancelled = true;
        if (signal.reason instanceof DOMException && signal.reason.name === "TimeoutError") {
          wasTimeout = true;
        }
        return;
      }

      const cleanText = response.text.trim();

      updateAreaExtractedText(area.id, cleanText);

      await saveExtraction({
        documentName: doc.name,
        areaName: area.name,
        pageIndex: area.pageIndex,
        zone: area.zone,
        extractedText: cleanText,
        provider: response.provider,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        wasCancelled = true;
        wasTimeout = true;
        return;
      }
      if (err instanceof DOMException && err.name === "AbortError") {
        wasCancelled = true;
        if (signal.reason instanceof DOMException && signal.reason.name === "TimeoutError") {
          wasTimeout = true;
        }
        return;
      }
      if (signal.aborted) {
        wasCancelled = true;
        if (signal.reason instanceof DOMException && signal.reason.name === "TimeoutError") {
          wasTimeout = true;
        }
        return;
      }
      updateAreaStatus(
        area.id,
        "error",
        err instanceof Error ? err.message : "Unknown error"
      );
    } finally {
      clearTimeout(timeoutId);
      if (wasTimeout) {
        updateAreaStatus(area.id, "error", i18n.t("ocr.timeout"));
      } else if (wasCancelled) {
        updateAreaStatus(area.id, "zone-defined");
      }
      setProcessing(false);
      setAbortController(null);
    }
  }, [setProcessing, setAbortController]);

  return { extractActive, isProcessing };
}
