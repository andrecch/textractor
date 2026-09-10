import { useDocumentStore } from "@/stores/documentStore";
import { renderPdfPageToCanvas, getCachedCanvas } from "@/services/pdfCache";

const RENDER_SCALE_MULTIPLIER = 2;

export async function getSourceCanvas(): Promise<HTMLCanvasElement> {
  const { document: doc, currentPage, zoom, rotationByPage } =
    useDocumentStore.getState();
  if (!doc) throw new Error("No document loaded");
  const rotation = rotationByPage[currentPage] ?? 0;

  if (doc.type === "pdf") {
    const scale = zoom * RENDER_SCALE_MULTIPLIER;
    return renderPdfPageToCanvas(doc.url, currentPage, scale, rotation);
  }

  const cached = getCachedCanvas(doc.url, currentPage, zoom, rotation);
  if (cached) return cached;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const width = img.naturalWidth * zoom;
      const height = img.naturalHeight * zoom;
      const swapped = rotation === 90 || rotation === 270;

      const canvas = document.createElement("canvas");
      canvas.width = swapped ? height : width;
      canvas.height = swapped ? width : height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get 2d context"));
        return;
      }
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = doc.url;
  });
}
