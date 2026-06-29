import { useCallback } from "react";
import { useOCRStore } from "@/stores/ocrStore";
import { useSectionStore } from "@/stores/sectionStore";
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
    const { getActiveSection, updateSectionStatus, updateSectionExtractedText, updateSectionCroppedImageProcessed } =
      useSectionStore.getState();

    if (!settings.ocrEnabled || !doc) return;

    const section = getActiveSection();
    if (!section || !section.zone) return;

    updateSectionStatus(section.id, "processing");
    setProcessing(true);

    try {
      const sourceCanvas = await getSourceCanvas();
      const cropped = cropZone(
        sourceCanvas,
        section.zone.x,
        section.zone.y,
        section.zone.width,
        section.zone.height
      );

      const imageData = settings.preprocessingEnabled
        ? preprocessImage(cropped)
        : cropped.toDataURL("image/png");

      updateSectionCroppedImageProcessed(section.id, imageData);

      const response = await ocrExtract(imageData, settings.apiKey || undefined);

      updateSectionExtractedText(section.id, response.text);

      await saveExtraction({
        documentName: doc.name,
        sectionName: section.name,
        pageIndex: section.pageIndex,
        zone: section.zone,
        extractedText: response.text,
        provider: response.provider,
      });
    } catch (err) {
      updateSectionStatus(
        section.id,
        "error",
        err instanceof Error ? err.message : "Unknown error"
      );
    } finally {
      setProcessing(false);
    }
  }, [setProcessing]);

  return { extractActive, isProcessing };
}
