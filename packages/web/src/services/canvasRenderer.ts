import * as pdfjsLib from "pdfjs-dist";
import { useDocumentStore } from "@/stores/documentStore";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

export async function getSourceCanvas(): Promise<HTMLCanvasElement> {
  const { document: doc, currentPage, zoom } = useDocumentStore.getState();
  if (!doc) throw new Error("No document loaded");

  return new Promise((resolve, reject) => {
    if (doc.type === "pdf") {
      (async () => {
        try {
          const pdf = await pdfjsLib.getDocument(doc.url).promise;
          const page = await pdf.getPage(currentPage + 1);
          const viewport = page.getViewport({ scale: zoom * 2 });
          const canvas = window.document.createElement("canvas");
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
        const canvas = window.document.createElement("canvas");
        canvas.width = img.naturalWidth * zoom;
        canvas.height = img.naturalHeight * zoom;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = doc.url;
    }
  });
}
