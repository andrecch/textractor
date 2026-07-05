import { createHash } from "crypto";

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 50;

interface CacheEntry {
  text: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function getCachedOcr(imageBase64: string): string | null {
  const hash = hashImage(imageBase64);
  const entry = cache.get(hash);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(hash);
    return null;
  }

  entry.expiresAt = Date.now() + CACHE_TTL_MS;
  return entry.text;
}

export function setCachedOcr(imageBase64: string, text: string): void {
  const hash = hashImage(imageBase64);
  cache.set(hash, {
    text,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  if (cache.size > MAX_CACHE_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
}

function hashImage(imageBase64: string): string {
  const payload = imageBase64.length > 1024 * 1024
    ? imageBase64.slice(0, 1024 * 1024)
    : imageBase64;
  return createHash("sha256").update(payload).digest("hex");
}

export function clearOcrCache(): void {
  cache.clear();
}
