import { useRef, useState, type PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ResizeHandleProps {
  side: "left" | "right";
  onResize: (delta: number) => void;
  className?: string;
}

export function ResizeHandle({ side, onResize, className }: ResizeHandleProps) {
  const { t } = useTranslation();
  const lastXRef = useRef(0);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const delta = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    onResize(side === "left" ? delta : -delta);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      title={t("layout.resizePanel")}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "group relative z-20 -mx-[3px] w-1.5 shrink-0 cursor-col-resize touch-none select-none",
        className
      )}
    >
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
      <span
        className={cn(
          "absolute top-1/2 left-1/2 h-10 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/60 transition-opacity",
          dragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      />
    </div>
  );
}
