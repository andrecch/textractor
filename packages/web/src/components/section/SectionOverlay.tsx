import { useSection } from "@/hooks/useSection";
import { useDocumentStore } from "@/stores/documentStore";
import { useSectionStore } from "@/stores/sectionStore";
import { cn } from "@/lib/utils";

interface SectionOverlayProps {
  width: number;
  height: number;
}

const ZONE_COLORS = [
  { border: "border-blue-500", bg: "bg-blue-500/10", label: "bg-blue-500/80 text-white" },
  { border: "border-green-500", bg: "bg-green-500/10", label: "bg-green-500/80 text-white" },
  { border: "border-purple-500", bg: "bg-purple-500/10", label: "bg-purple-500/80 text-white" },
  { border: "border-orange-500", bg: "bg-orange-500/10", label: "bg-orange-500/80 text-white" },
  { border: "border-pink-500", bg: "bg-pink-500/10", label: "bg-pink-500/80 text-white" },
  { border: "border-teal-500", bg: "bg-teal-500/10", label: "bg-teal-500/80 text-white" },
];

function getZoneColor(index: number) {
  return ZONE_COLORS[index % ZONE_COLORS.length]!;
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
  const { sections } = useSectionStore();

  const visibleZones = sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => section.zone && section.pageIndex === currentPage);

  const previewColor = getZoneColor(sections.length);

  return (
    <div
      className="absolute inset-0 cursor-crosshair"
      style={{ width, height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {visibleZones.map(({ section, index }) => {
        const color = getZoneColor(index);
        const isActive = section.id === activeSection?.id;
        const borderWidth = isActive ? "border-3" : "border-2";
        const shadow = isActive ? "shadow-sm" : "";

        return (
          <div
            key={section.id}
            className={cn(
              "absolute pointer-events-none",
              borderWidth,
              color.border,
              color.bg,
              shadow
            )}
            style={{
              left: section.zone!.x,
              top: section.zone!.y,
              width: section.zone!.width,
              height: section.zone!.height,
            }}
          >
            <span
              className={cn(
                "absolute top-0 left-0 px-1.5 py-0.5 text-xs rounded-br",
                color.label
              )}
            >
              {section.name}
            </span>
          </div>
        );
      })}
      {isDrawing && previewRect && previewRect.width > 0 && previewRect.height > 0 && (
        <div
          className={cn(
            "absolute border-2 border-dashed pointer-events-none",
            previewColor.border,
            previewColor.bg
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
