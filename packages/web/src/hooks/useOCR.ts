import { useCallback } from "react";
import { useOCRStore } from "@/stores/ocrStore";
import { useAreaStore } from "@/stores/areaStore";
import { useDocumentStore } from "@/stores/documentStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { preprocessImage, cropZone } from "@/services/imageProcessing";
import { getSourceCanvas } from "@/services/canvasRenderer";
import { ocrExtract, saveExtraction } from "@/services/api";

const OCR_JPEG_QUALITY = 0.85;

export function useOCR() {
  const { isProcessing, setProcessing } = useOCRStore();

  const extractActive = useCallback(async () => {
    const { settings } = useSettingsStore.getState();
    const { document: doc } = useDocumentStore.getState();
    const { getActiveArea, updateAreaStatus, updateAreaExtractedText, setAreaCroppedImageProcessed } =
      useAreaStore.getState();

    if (!settings.ocrEnabled || !doc) return;

    const area = getActiveArea();
    if (!area || !area.zone) return;

    updateAreaStatus(area.id, "processing");
    setProcessing(true);

    try {
      const sourceCanvas = await getSourceCanvas();
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

      const response = await ocrExtract(ocrPayload, settings.apiKey || undefined);
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
      updateAreaStatus(
        area.id,
        "error",
        err instanceof Error ? err.message : "Unknown error"
      );
    } finally {
      setProcessing(false);
    }
  }, [setProcessing]);

  return { extractActive, isProcessing };
}
