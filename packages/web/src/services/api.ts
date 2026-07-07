const API_BASE = "/api";

export async function ocrExtract(
  imageBase64: string,
  apiKey?: string,
  signal?: AbortSignal
): Promise<{ text: string; provider: string }> {
  const body: Record<string, string> = { imageBase64 };
  if (apiKey) {
    body.apiKey = apiKey;
  }

  const response = await fetch(`${API_BASE}/ocr/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? "OCR request failed");
  }

  return response.json();
}

export async function getApiKeyStatus(): Promise<{ hasKey: boolean; preview: string }> {
  const response = await fetch(`${API_BASE}/config/api-key`);
  if (!response.ok) {
    return { hasKey: false, preview: "" };
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

export interface HistoryResponse {
  records: Array<{
    id: string;
    documentName: string;
    sectionName: string;
    pageIndex: number;
    zone: { x: number; y: number; width: number; height: number };
    extractedText: string;
    provider: string;
    createdAt: string;
  }>;
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export async function getHistory(
  limit = 20,
  offset = 0
): Promise<HistoryResponse> {
  const params = new URLSearchParams({
    paged: "true",
    limit: String(limit),
    offset: String(offset),
  });
  const response = await fetch(`${API_BASE}/history?${params}`);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
}

export async function saveExtraction(data: {
  documentName: string;
  areaName: string;
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
