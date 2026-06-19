const API_BASE = "/api";

export async function ocrExtract(
  imageBase64: string,
  apiKey: string
): Promise<{ text: string; provider: string }> {
  const response = await fetch(`${API_BASE}/ocr/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, apiKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? "OCR request failed");
  }

  return response.json();
}

export async function ocrValidate(
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  const response = await fetch(`${API_BASE}/ocr/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });

  if (!response.ok) {
    return { valid: false, error: "Connection failed" };
  }

  return response.json();
}

export async function getHistory(): Promise<unknown[]> {
  const response = await fetch(`${API_BASE}/history`);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
}

export async function saveExtraction(data: {
  documentName: string;
  sectionName: string;
  pageIndex: number;
  zone: { x: number; y: number; width: number; height: number };
  extractedText: string;
  provider: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to save extraction");
}

export async function clearHistory(): Promise<void> {
  const response = await fetch(`${API_BASE}/history`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to clear history");
}
