import { useCallback, useState } from "react";

interface PanelSizeOptions {
  defaultWidth: number;
  min: number;
  max: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function loadWidth(storageKey: string, options: PanelSizeOptions): number {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === null) return options.defaultWidth;
    const parsed = Number(stored);
    if (!Number.isFinite(parsed)) return options.defaultWidth;
    return clamp(parsed, options.min, options.max);
  } catch {
    return options.defaultWidth;
  }
}

export function usePanelSize(storageKey: string, options: PanelSizeOptions) {
  const { min, max } = options;
  const [width, setWidth] = useState(() => loadWidth(storageKey, options));

  const resizeBy = useCallback(
    (delta: number) => {
      setWidth((prev) => {
        const next = clamp(prev + delta, min, max);
        try {
          window.localStorage.setItem(storageKey, String(next));
        } catch {
          // ignore storage failures
        }
        return next;
      });
    },
    [min, max, storageKey]
  );

  return { width, resizeBy };
}
