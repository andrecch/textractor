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
  const { defaultWidth, min, max } = options;
  const [width, setWidth] = useState(() => loadWidth(storageKey, options));

  const persist = useCallback(
    (value: number) => {
      try {
        window.localStorage.setItem(storageKey, String(value));
      } catch {
        // ignore storage failures
      }
    },
    [storageKey]
  );

  const resizeBy = useCallback(
    (delta: number) => {
      setWidth((prev) => {
        const next = clamp(prev + delta, min, max);
        persist(next);
        return next;
      });
    },
    [min, max, persist]
  );

  const reset = useCallback(() => {
    const value = clamp(defaultWidth, min, max);
    persist(value);
    setWidth(value);
  }, [defaultWidth, min, max, persist]);

  return { width, resizeBy, reset };
}
