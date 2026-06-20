import { useCallback, useEffect, useRef, useState } from "react";
import { useSectionStore } from "@/stores/sectionStore";
import { useDocumentStore } from "@/stores/documentStore";
import type { SectionRegion } from "@/types/section";
import { getSourceCanvas } from "@/services/canvasRenderer";
import { cropRegion } from "@/services/imageProcessing";

export function useSection() {
  const {
    sections,
    activeSectionId,
    getActiveSection,
    setActiveSection,
    addSection,
    removeSection,
    renameSection,
    updateSectionRegion,
    updateSectionCroppedImageRaw,
  } = useSectionStore();
  const { currentPage } = useDocumentStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const [previewRect, setPreviewRect] = useState<SectionRegion | null>(null);

  const activeSection = getActiveSection();

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || !activeSectionId) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      startPoint.current = { x, y };
      setIsDrawing(true);
      setPreviewRect({ x, y, width: 0, height: 0 });
    },
    [activeSectionId]
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

      setPreviewRect({ x, y, width, height });
    },
    [isDrawing]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !previewRect || !activeSectionId) return;

    if (previewRect.width > 5 && previewRect.height > 5) {
      updateSectionRegion(activeSectionId, currentPage, previewRect);
    }

    startPoint.current = null;
    setIsDrawing(false);
    setPreviewRect(null);
  }, [isDrawing, previewRect, activeSectionId, currentPage, updateSectionRegion]);

  useEffect(() => {
    if (!activeSection || !activeSection.region) return;
    if (activeSection.pageIndex !== currentPage) return;

    let cancelled = false;
    (async () => {
      try {
        const sourceCanvas = await getSourceCanvas();
        if (cancelled) return;
        const r = activeSection.region!;
        const cropped = cropRegion(sourceCanvas, r.x, r.y, r.width, r.height);
        if (cancelled) return;
        const dataUrl = cropped.toDataURL("image/png");
        if (cancelled) return;
        updateSectionCroppedImageRaw(activeSection.id, dataUrl);
      } catch {
        // Silently ignore render errors; the OCR step will surface them.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    activeSection,
    currentPage,
    activeSectionId,
    updateSectionCroppedImageRaw,
  ]);

  return {
    sections,
    activeSection,
    activeSectionId,
    isDrawing,
    previewRect,
    setActiveSection,
    addSection,
    removeSection,
    renameSection,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
