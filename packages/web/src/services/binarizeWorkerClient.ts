import BinarizeWorker from "@/workers/binarize.worker?worker";

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<
  number,
  { resolve: (data: ImageData) => void; reject: (err: Error) => void }
>();

function getWorker(): Worker {
  if (!worker) {
    worker = new BinarizeWorker();
    worker.onmessage = (e: MessageEvent<{ id: number; imageData: ImageData; error?: string }>) => {
      const { id, imageData, error } = e.data;
      const handler = pending.get(id);
      if (!handler) return;
      pending.delete(id);
      if (error) {
        handler.reject(new Error(error));
      } else {
        handler.resolve(imageData);
      }
    };
    worker.onerror = () => {
      for (const handler of pending.values()) {
        handler.reject(new Error("Worker error"));
      }
      pending.clear();
    };
  }
  return worker;
}

export function binarizeImageData(
  imageData: ImageData,
  threshold: number
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, imageData, threshold });
  });
}

export function terminateBinarizeWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  for (const handler of pending.values()) {
    handler.reject(new Error("Worker terminated"));
  }
  pending.clear();
}
