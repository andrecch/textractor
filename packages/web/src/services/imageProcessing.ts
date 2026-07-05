import { binarizeImageData } from "@/services/binarizeWorkerClient";

export interface PreprocessOptions {
  grayscale: boolean;
  brightness: number;
  contrast: number;
  binarize: boolean;
  binarizeThreshold: number;
}

const DEFAULT_OPTIONS: PreprocessOptions = {
  grayscale: true,
  brightness: 1.0,
  contrast: 1.2,
  binarize: false,
  binarizeThreshold: 128,
};

export interface PreprocessResult {
  canvas: HTMLCanvasElement;
  dataUrl: string;
}

export async function preprocessImage(
  sourceCanvas: HTMLCanvasElement,
  options: Partial<PreprocessOptions> = {}
): Promise<PreprocessResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height } = sourceCanvas;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = width;
  outputCanvas.height = height;
  const ctx = outputCanvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context");

  ctx.filter = [
    opts.grayscale ? "grayscale(100%)" : "",
    `brightness(${opts.brightness})`,
    `contrast(${opts.contrast})`,
  ]
    .filter(Boolean)
    .join(" ");

  ctx.drawImage(sourceCanvas, 0, 0);

  ctx.filter = "none";

  if (opts.binarize) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const binarized = await binarizeImageData(
      imageData,
      opts.binarizeThreshold
    );
    ctx.putImageData(binarized, 0, 0);
  }

  return {
    canvas: outputCanvas,
    dataUrl: outputCanvas.toDataURL("image/png"),
  };
}

export function cropZone(
  sourceCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): HTMLCanvasElement {
  const cropped = document.createElement("canvas");
  cropped.width = width;
  cropped.height = height;
  const ctx = cropped.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context");
  ctx.drawImage(sourceCanvas, x, y, width, height, 0, 0, width, height);
  return cropped;
}
