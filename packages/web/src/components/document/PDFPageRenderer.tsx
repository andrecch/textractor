import { useEffect, useRef, useCallback } from "react";
import { getCachedCanvas, renderPdfPageToCanvas } from "@/services/pdfCache";

interface PDFPageRendererProps {
  url: string;
  pageIndex: number;
  zoom: number;
  onPageSizeChange: (width: number, height: number) => void;
}

const SCALE_MULTIPLIER = 2;

export function PDFPageRenderer({
  url,
  pageIndex,
  zoom,
  onPageSizeChange,
}: PDFPageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const rafRef = useRef<number | null>(null);
  const sequenceRef = useRef(0);

  const renderPage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = zoom * SCALE_MULTIPLIER;
    const mySequence = ++sequenceRef.current;

    const cached = getCachedCanvas(url, pageIndex, scale);
    if (cached) {
      if (mySequence !== sequenceRef.current) return;
      canvas.width = cached.width;
      canvas.height = cached.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(cached, 0, 0);
      onPageSizeChange(cached.width, cached.height);
      return;
    }

    try {
      const renderedCanvas = await renderPdfPageToCanvas(
        url,
        pageIndex,
        scale
      );

      if (mySequence !== sequenceRef.current) return;
      if (!canvasRef.current) return;

      canvas.width = renderedCanvas.width;
      canvas.height = renderedCanvas.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(renderedCanvas, 0, 0);
      onPageSizeChange(renderedCanvas.width, renderedCanvas.height);

      renderTaskRef.current = { cancel: () => {} };
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
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className="max-w-none shadow-lg" />;
}
