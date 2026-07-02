import { useCallback } from "react";
import { useOCRStore } from "@/stores/ocrStore";
import { useAreaStore } from "@/stores/areaStore";
import { useDocumentStore } from "@/stores/documentStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { preprocessImage, cropZone } from "@/services/imageProcessing";
import { getSourceCanvas } from "@/services/canvasRenderer";
import { ocrExtract, saveExtraction } from "@/services/api";

export function useOCR() {
  const { isProcessing, setProcessing } = useOCRStore();

  const extractActive = useCallback(async () => {
    const { settings } = useSettingsStore.getState();
    const { document: doc } = useDocumentStore.getState();
    const { getActiveArea, updateAreaStatus, updateAreaExtractedText, updateAreaCroppedImageProcessed } =
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

      const imageData = settings.preprocessingEnabled
        ? preprocessImage(cropped)
        : cropped.toDataURL("image/png");

      updateAreaCroppedImageProcessed(area.id, imageData);

      const response = await ocrExtract(imageData, settings.apiKey || undefined);

      updateAreaExtractedText(area.id, response.text);

      await saveExtraction({
        documentName: doc.name,
        areaName: area.name,
        pageIndex: area.pageIndex,
        zone: area.zone,
        extractedText: response.text,
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
