import { useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

interface PDFPageRendererProps {
  url: string;
  pageIndex: number;
  zoom: number;
  onPageSizeChange: (width: number, height: number) => void;
}

export function PDFPageRenderer({
  url,
  pageIndex,
  zoom,
  onPageSizeChange,
}: PDFPageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const rafRef = useRef<number | null>(null);

  const renderPage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      if (!pdfDocRef.current) {
        pdfDocRef.current = await pdfjsLib.getDocument(url).promise;
      }

      const pdfDoc = pdfDocRef.current;
      const page = await pdfDoc.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale: zoom * 2 });

      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      onPageSizeChange(viewport.width, viewport.height);

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const renderTask = page.render({
        canvasContext: context,
        viewport,
      });
      renderTaskRef.current = renderTask;

      await renderTask.promise;
    } catch (err) {
      if (err instanceof Error && err.name !== "RenderingCancelledException") {
        console.error("Error rendering PDF page:", err);
      }
    }
  }, [url, pageIndex, zoom, onPageSizeChange]);

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      renderPage();
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [renderPage]);

  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      pdfDocRef.current?.destroy();
      pdfDocRef.current = null;
    };
  }, [url]);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-none shadow-lg"
    />
  );
}
