import { pdfjsLib } from "@/services/pdfConfig";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface CachedDocument {
  doc: PDFDocumentProxy;
  refCount: number;
}

interface CachedCanvas {
  canvas: HTMLCanvasElement;
  lastAccessed: number;
}

const MAX_CACHED_CANVASES = 12;

const documentCache = new Map<string, CachedDocument>();
const canvasCache = new Map<string, CachedCanvas>();

function canvasKey(url: string, pageIndex: number, scale: number): string {
  return `${url}::${pageIndex}::${scale}`;
}

async function getCachedDocument(url: string): Promise<PDFDocumentProxy> {
  const existing = documentCache.get(url);
  if (existing) {
    existing.refCount += 1;
    return existing.doc;
  }

  const doc = await pdfjsLib.getDocument(url).promise;
  documentCache.set(url, { doc, refCount: 1 });
  return doc;
}

function releaseDocument(url: string): void {
  const cached = documentCache.get(url);
  if (!cached) return;

  cached.refCount -= 1;
  if (cached.refCount <= 0) {
    cached.doc.destroy();
    documentCache.delete(url);

    for (const key of canvasCache.keys()) {
      if (key.startsWith(`${url}::`)) {
        canvasCache.delete(key);
      }
    }
  }
}

function touchCanvas(key: string, canvas: HTMLCanvasElement): void {
  canvasCache.set(key, { canvas, lastAccessed: Date.now() });
}

function evictOldCanvases(): void {
  if (canvasCache.size <= MAX_CACHED_CANVASES) return;

  const entries = Array.from(canvasCache.entries()).sort(
    (a, b) => a[1].lastAccessed - b[1].lastAccessed
  );

  const toRemove = entries.slice(0, canvasCache.size - MAX_CACHED_CANVASES);
  for (const [key] of toRemove) {
    canvasCache.delete(key);
  }
}

export async function acquirePdfDocument(url: string): Promise<PDFDocumentProxy> {
  return getCachedDocument(url);
}

export function releasePdfDocument(url: string): void {
  releaseDocument(url);
}

export function getCachedCanvas(
  url: string,
  pageIndex: number,
  scale: number
): HTMLCanvasElement | null {
  const key = canvasKey(url, pageIndex, scale);
  const cached = canvasCache.get(key);
  if (!cached) return null;

  cached.lastAccessed = Date.now();
  return cached.canvas;
}

export function setCachedCanvas(
  url: string,
  pageIndex: number,
  scale: number,
  canvas: HTMLCanvasElement
): void {
  const key = canvasKey(url, pageIndex, scale);
  touchCanvas(key, canvas);
  evictOldCanvases();
}

export async function renderPdfPageToCanvas(
  url: string,
  pageIndex: number,
  scale: number
): Promise<HTMLCanvasElement> {
  const cached = getCachedCanvas(url, pageIndex, scale);
  if (cached) return cached;

  const pdfDoc = await acquirePdfDocument(url);
  try {
    const page = await pdfDoc.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2d context");

    await page.render({ canvasContext: ctx, viewport }).promise;

    setCachedCanvas(url, pageIndex, scale, canvas);
    return canvas;
  } finally {
    releasePdfDocument(url);
  }
}

export function clearAllPdfCaches(): void {
  for (const { doc } of documentCache.values()) {
    doc.destroy();
  }
  documentCache.clear();
  canvasCache.clear();
}
