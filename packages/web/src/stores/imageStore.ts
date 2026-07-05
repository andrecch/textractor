type ImageKind = "raw" | "processed";

type Listener = () => void;

const imageMap = new Map<string, string>();

const listeners = new Map<string, Set<Listener>>();

function notify(areaId: string): void {
  const set = listeners.get(areaId);
  if (!set) return;
  for (const fn of set) fn();
}

export function setAreaImage(
  areaId: string,
  kind: ImageKind,
  image: string | null
): void {
  const key = `${areaId}:${kind}`;
  if (image === null) {
    if (imageMap.delete(key)) notify(areaId);
    return;
  }
  imageMap.set(key, image);
  notify(areaId);
}

export function getAreaImage(
  areaId: string,
  kind: ImageKind
): string | null {
  return imageMap.get(`${areaId}:${kind}`) ?? null;
}

export function hasAreaImage(areaId: string, kind: ImageKind): boolean {
  return imageMap.has(`${areaId}:${kind}`);
}

export function clearAreaImages(areaId: string): void {
  const raw = `${areaId}:raw`;
  const proc = `${areaId}:processed`;
  let changed = false;
  if (imageMap.delete(raw)) changed = true;
  if (imageMap.delete(proc)) changed = true;
  if (changed) notify(areaId);
}

export function clearAllImages(): void {
  if (imageMap.size === 0) return;
  const areaIds = new Set<string>();
  for (const key of imageMap.keys()) {
    const areaId = key.split(":")[0];
    if (areaId) areaIds.add(areaId);
  }
  imageMap.clear();
  for (const areaId of areaIds) notify(areaId);
}

export function subscribeAreaImages(areaId: string, fn: Listener): () => void {
  let set = listeners.get(areaId);
  if (!set) {
    set = new Set();
    listeners.set(areaId, set);
  }
  set.add(fn);
  return () => {
    set?.delete(fn);
    if (set && set.size === 0) {
      listeners.delete(areaId);
    }
  };
}
