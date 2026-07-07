import { useCallback } from "react";
import { useOCRStore } from "@/stores/ocrStore";
import { useAreaStore } from "@/stores/areaStore";
import { useDocumentStore } from "@/stores/documentStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { preprocessImage, cropZone } from "@/services/imageProcessing";
import { getSourceCanvas } from "@/services/canvasRenderer";
import { ocrExtract, saveExtraction } from "@/services/api";
import i18n from "@/i18n";

const OCR_JPEG_QUALITY = 0.85;
const OCR_TIMEOUT_MS = 30000;

export function useOCR() {
  const { isProcessing, setProcessing, setAbortController } = useOCRStore();

  const extractActive = useCallback(async () => {
    const { settings } = useSettingsStore.getState();
    const { document: doc } = useDocumentStore.getState();
    const { getActiveArea, updateAreaStatus, updateAreaExtractedText, setAreaCroppedImageProcessed } =
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
      const sourceCanvas = await getSourceCanvas();
      if (signal.aborted) {
        wasCancelled = true;
        if (signal.reason instanceof DOMException && signal.reason.name === "TimeoutError") {
          wasTimeout = true;
        }
        return;
      }

      const cropped = cropZone(
        sourceCanvas,
        area.zone.x,
        area.zone.y,
        area.zone.width,
        area.zone.height
      );

      let ocrCanvas: HTMLCanvasElement;
      let displayDataUrl: string;

      if (settings.preprocessingEnabled) {
        const { canvas, dataUrl } = await preprocessImage(cropped);
        ocrCanvas = canvas;
        displayDataUrl = dataUrl;
      } else {
        ocrCanvas = cropped;
        displayDataUrl = cropped.toDataURL("image/png");
      }

      setAreaCroppedImageProcessed(area.id, displayDataUrl);

      const ocrPayload = ocrCanvas.toDataURL("image/jpeg", OCR_JPEG_QUALITY);

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
