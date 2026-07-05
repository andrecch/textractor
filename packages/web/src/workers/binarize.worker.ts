interface BinarizeRequest {
  id: number;
  imageData: ImageData;
  threshold: number;
}

interface BinarizeResponse {
  id: number;
  imageData: ImageData;
  error?: string;
}

self.onmessage = (e: MessageEvent<BinarizeRequest>) => {
  const { id, imageData, threshold } = e.data;
  try {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i]! + data[i + 1]! + data[i + 2]!) / 3;
      const val = avg >= threshold ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
    const response: BinarizeResponse = { id, imageData };
    (self as unknown as Worker).postMessage(response, [imageData.data.buffer]);
  } catch (err) {
    const response: BinarizeResponse = {
      id,
      imageData,
      error: err instanceof Error ? err.message : "Unknown error",
    };
    (self as unknown as Worker).postMessage(response);
  }
};

export {};
