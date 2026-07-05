import { useSyncExternalStore } from "react";
import {
  getAreaImage,
  subscribeAreaImages,
  setAreaImage,
  hasAreaImage,
} from "@/stores/imageStore";

type ImageKind = "raw" | "processed";

export function useAreaImage(
  areaId: string | null | undefined,
  kind: ImageKind
): string | null {
  return useSyncExternalStore(
    (onChange) => {
      if (!areaId) return () => {};
      return subscribeAreaImages(areaId, onChange);
    },
    () => (areaId ? getAreaImage(areaId, kind) : null),
    () => null
  );
}

export function useAreaImageExists(
  areaId: string | null | undefined,
  kind: ImageKind
): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (!areaId) return () => {};
      return subscribeAreaImages(areaId, onChange);
    },
    () => (areaId ? hasAreaImage(areaId, kind) : false),
    () => false
  );
}

export { setAreaImage };
