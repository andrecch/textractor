import { useCallback } from "react";
import { useOCRStore } from "@/stores/ocrStore";
import { useSectionStore } from "@/stores/sectionStore";
import { useDocumentStore } from "@/stores/documentStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { preprocessImage, cropRegion } from "@/services/imageProcessing";
import { ocrExtract, saveExtraction } from "@/services/api";
import * as pdfjsLib from "pdfjs-dist";

async function getSourceCanvas(): Promise<HTMLCanvasElement> {
  const { document, currentPage, zoom } = useDocumentStore.getState();
  if (!document) throw new Error("No document loaded");

  return new Promise((resolve, reject) => {
    if (document.type === "pdf") {
      (async () => {
        try {
          const pdf = await pdfjsLib.getDocument(document.url).promise;
          const page = await pdf.getPage(currentPage + 1);
          const viewport = page.getViewport({ scale: zoom * 2 });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;
          pdf.destroy();
          resolve(canvas);
        } catch (err) {
          reject(err);
        }
      })();
    } else {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth * zoom;
        canvas.height = img.naturalHeight * zoom;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = document.url;
    }
  });
}

export function useOCR() {
  const { isProcessing, setProcessing } = useOCRStore();

  const extractActive = useCallback(async () => {
    const { settings } = useSettingsStore.getState();
    const { document } = useDocumentStore.getState();
    const { getActiveSection, updateSectionStatus, updateSectionExtractedText, updateSectionCroppedImage } =
      useSectionStore.getState();

    if (!settings.ocrEnabled || !settings.apiKey || !document) return;

    const section = getActiveSection();
    if (!section || !section.region) return;

    updateSectionStatus(section.id, "processing");
    setProcessing(true);

    try {
      const sourceCanvas = await getSourceCanvas();
      const cropped = cropRegion(
        sourceCanvas,
        section.region.x,
        section.region.y,
        section.region.width,
        section.region.height
      );

      const imageData = settings.preprocessingEnabled
        ? preprocessImage(cropped)
        : cropped.toDataURL("image/png");

      updateSectionCroppedImage(section.id, imageData);

      const response = await ocrExtract(imageData, settings.apiKey);

      updateSectionExtractedText(section.id, response.text);

      await saveExtraction({
        documentName: document.name,
        sectionName: section.name,
        pageIndex: section.pageIndex,
        zone: section.region,
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
