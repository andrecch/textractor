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

export function preprocessImage(
  sourceCanvas: HTMLCanvasElement,
  options: Partial<PreprocessOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height } = sourceCanvas;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = width;
  outputCanvas.height = height;
  const ctx = outputCanvas.getContext("2d")!;

  ctx.filter = [
    opts.grayscale ? "grayscale(100%)" : "",
    `brightness(${opts.brightness})`,
    `contrast(${opts.contrast})`,
  ]
    .filter(Boolean)
    .join(" ");

  ctx.drawImage(sourceCanvas, 0, 0);

  if (opts.binarize) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i]! + data[i + 1]! + data[i + 2]!) / 3;
      const val = avg >= opts.binarizeThreshold ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return outputCanvas.toDataURL("image/png");
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
  const ctx = cropped.getContext("2d")!;
  ctx.drawImage(sourceCanvas, x, y, width, height, 0, 0, width, height);
  return cropped;
}
