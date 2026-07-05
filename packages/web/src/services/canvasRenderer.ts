import { useDocumentStore } from "@/stores/documentStore";
import { renderPdfPageToCanvas, getCachedCanvas } from "@/services/pdfCache";

const RENDER_SCALE_MULTIPLIER = 2;

export async function getSourceCanvas(): Promise<HTMLCanvasElement> {
  const { document: doc, currentPage, zoom } = useDocumentStore.getState();
  if (!doc) throw new Error("No document loaded");

  if (doc.type === "pdf") {
    const scale = zoom * RENDER_SCALE_MULTIPLIER;
    return renderPdfPageToCanvas(doc.url, currentPage, scale);
  }

  const cached = getCachedCanvas(doc.url, currentPage, zoom);
  if (cached) return cached;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth * zoom;
      canvas.height = img.naturalHeight * zoom;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get 2d context"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = doc.url;
  });
}
