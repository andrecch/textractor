import { useEffect, useRef, useState, type RefObject } from "react";

export interface UsePanModeResult {
  isPanActive: boolean;
  isPanning: boolean;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") {
    return true;
  }
  return target.isContentEditable;
}

export function usePanMode(
  scrollContainerRef: RefObject<HTMLDivElement | null>
): UsePanModeResult {
  const [isPanActive, setIsPanActive] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  const isPanActiveRef = useRef(false);
  const isPanningRef = useRef(false);
  const panStateRef = useRef<{
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (e.repeat) return;
      if (isPanActiveRef.current) return;
      if (isInteractiveTarget(e.target)) return;

      e.preventDefault();
      isPanActiveRef.current = true;
      setIsPanActive(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (!isPanActiveRef.current) return;

      isPanActiveRef.current = false;
      isPanningRef.current = false;
      panStateRef.current = null;
      setIsPanActive(false);
      setIsPanning(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isPanActiveRef.current) return;
      if (e.button !== 0) return;
      if (isInteractiveTarget(e.target)) return;

      const container = scrollContainerRef.current;
      if (!container) return;
      if (!container.contains(e.target as Node)) return;

      e.preventDefault();

      panStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startScrollLeft: container.scrollLeft,
        startScrollTop: container.scrollTop,
      };
      isPanningRef.current = true;
      setIsPanning(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      const panState = panStateRef.current;
      if (!panState) return;

      const container = scrollContainerRef.current;
      if (!container) return;

      const dx = e.clientX - panState.startX;
      const dy = e.clientY - panState.startY;

      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const maxScrollTop = container.scrollHeight - container.clientHeight;

      container.scrollLeft = Math.max(
        0,
        Math.min(maxScrollLeft, panState.startScrollLeft + dx)
      );
      container.scrollTop = Math.max(
        0,
        Math.min(maxScrollTop, panState.startScrollTop + dy)
      );
    };

    const handleMouseUp = () => {
      if (!isPanningRef.current) return;

      isPanningRef.current = false;
      panStateRef.current = null;
      setIsPanning(false);
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [scrollContainerRef]);

  return { isPanActive, isPanning };
}
