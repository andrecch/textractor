import { useSection } from "@/hooks/useSection";
import { useDocumentStore } from "@/stores/documentStore";
import { cn } from "@/lib/utils";

interface SectionOverlayProps {
  width: number;
  height: number;
}

export function SectionOverlay({ width, height }: SectionOverlayProps) {
  const {
    activeSection,
    isDrawing,
    previewRect,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useSection();
  const { currentPage } = useDocumentStore();

  const showZone =
    activeSection &&
    activeSection.pageIndex === currentPage &&
    activeSection.zone;

  return (
    <div
      className="absolute inset-0 cursor-crosshair"
      style={{ width, height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {showZone && activeSection.zone && (
        <div
          className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
          style={{
            left: activeSection.zone.x,
            top: activeSection.zone.y,
            width: activeSection.zone.width,
            height: activeSection.zone.height,
          }}
        />
      )}
      {isDrawing && previewRect && previewRect.width > 0 && previewRect.height > 0 && (
        <div
          className={cn(
            "absolute border-2 border-dashed border-blue-500 bg-blue-500/10 pointer-events-none"
          )}
          style={{
            left: previewRect.x,
            top: previewRect.y,
            width: previewRect.width,
            height: previewRect.height,
          }}
        />
      )}
    </div>
  );
}
