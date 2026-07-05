import { useCallback, useEffect, useRef, useState } from "react";
import { useAreaStore } from "@/stores/areaStore";
import { useDocumentStore } from "@/stores/documentStore";
import type { AreaZone } from "@/types/area";
import { getSourceCanvas } from "@/services/canvasRenderer";
import { cropZone } from "@/services/imageProcessing";

export function useArea() {
  const {
    areas,
    activeAreaId,
    getActiveArea,
    setActiveArea,
    addArea: addAreaRaw,
    removeArea,
    renameArea,
    updateAreaZone,
    setAreaCroppedImageRaw,
  } = useAreaStore();
  const { currentPage, document } = useDocumentStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const [previewRect, setPreviewRect] = useState<AreaZone | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingRectRef = useRef<AreaZone | null>(null);

  const flushPreviewRect = useCallback(() => {
    rafIdRef.current = null;
    if (pendingRectRef.current) {
      setPreviewRect(pendingRectRef.current);
      pendingRectRef.current = null;
    }
  }, []);

  const schedulePreviewRect = useCallback(
    (rect: AreaZone) => {
      pendingRectRef.current = rect;
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(flushPreviewRect);
    },
    [flushPreviewRect]
  );

  const activeArea = getActiveArea();

  const addArea = useCallback(() => {
    if (!document) return;
    addAreaRaw(document.name);
  }, [document, addAreaRaw]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || !activeAreaId) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      startPoint.current = { x, y };
      setIsDrawing(true);
      setPreviewRect({ x, y, width: 0, height: 0 });
    },
    [activeAreaId]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || !startPoint.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const x = Math.min(startPoint.current.x, currentX);
      const y = Math.min(startPoint.current.y, currentY);
      const width = Math.abs(currentX - startPoint.current.x);
      const height = Math.abs(currentY - startPoint.current.y);

      schedulePreviewRect({ x, y, width, height });
    },
    [isDrawing, schedulePreviewRect]
  );

  const handleMouseUp = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (!isDrawing || !previewRect || !activeAreaId) return;

    if (previewRect.width > 5 && previewRect.height > 5) {
      updateAreaZone(activeAreaId, currentPage, previewRect);
    }

    startPoint.current = null;
    setIsDrawing(false);
    setPreviewRect(null);
  }, [isDrawing, previewRect, activeAreaId, currentPage, updateAreaZone]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!activeArea || !activeArea.zone) return;
    if (activeArea.pageIndex !== currentPage) return;

    let cancelled = false;
    (async () => {
      try {
        const sourceCanvas = await getSourceCanvas();
        if (cancelled) return;
        const z = activeArea.zone!;
        const cropped = cropZone(sourceCanvas, z.x, z.y, z.width, z.height);
        if (cancelled) return;
        const dataUrl = cropped.toDataURL("image/png");
        if (cancelled) return;
        setAreaCroppedImageRaw(activeArea.id, dataUrl);
      } catch {
        // Silently ignore render errors; the OCR step will surface them.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    activeArea,
    currentPage,
    activeAreaId,
    setAreaCroppedImageRaw,
  ]);

  return {
    areas,
    activeArea,
    activeAreaId,
    isDrawing,
    previewRect,
    setActiveArea,
    addArea,
    removeArea,
    renameArea,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
