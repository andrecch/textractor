const API_BASE = "/api";

export class OcrServerError extends Error {
  constructor() {
    super("OCR server unreachable");
    this.name = "OcrServerError";
  }
}

export class OcrModelRetiredError extends Error {
  constructor(detail?: string) {
    super(detail ?? "OCR model retired");
    this.name = "OcrModelRetiredError";
  }
}

const RETIRED_MODEL_PATTERNS = [
  /end of life/i,
  /no longer available/i,
  /\bretired\b/i,
  /\bdeprecated\b/i,
];

async function readJsonBody(response: Response): Promise<Record<string, unknown>> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new OcrServerError();
  }
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    throw new OcrServerError();
  }
}

export async function ocrExtract(
  imageBase64: string,
  model?: string,
  signal?: AbortSignal
): Promise<{ text: string; provider: string }> {
  const body: Record<string, string> = { imageBase64 };
  if (model) {
    body.model = model;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/ocr/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    throw new OcrServerError();
  }

  if (!response.ok) {
    let serverDown = false;
    let message = "OCR request failed";
    try {
      const errorBody = await readJsonBody(response);
      const serverMessage = errorBody.error;
      if (typeof serverMessage === "string" && serverMessage.length > 0) {
        message = serverMessage;
        if (
          response.status === 410 ||
          RETIRED_MODEL_PATTERNS.some((pattern) => pattern.test(serverMessage))
        ) {
          throw new OcrModelRetiredError(serverMessage);
        }
      }
    } catch (err) {
      if (err instanceof OcrServerError) serverDown = true;
      else if (err instanceof OcrModelRetiredError) throw err;
    }
    if (serverDown) throw new OcrServerError();
    throw new Error(message);
  }

  const data = await readJsonBody(response);
  return {
    text: typeof data.text === "string" ? data.text : "",
    provider: typeof data.provider === "string" ? data.provider : "unknown",
  };
}

export type ApiKeySource = "server" | "user" | "none";

export async function getApiKeyStatus(): Promise<{
  hasKey: boolean;
  source: ApiKeySource;
}> {
  const response = await fetch(`${API_BASE}/config/api-key`);
  if (!response.ok) {
    return { hasKey: false, source: "none" };
  }
  return response.json();
}

export async function setApiKey(apiKey: string): Promise<void> {
  const response = await fetch(`${API_BASE}/config/api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? "Failed to save API key");
  }
}

export async function clearApiKey(): Promise<void> {
  const response = await fetch(`${API_BASE}/config/api-key`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to clear API key");
}

export async function ocrValidate(
  apiKey?: string
): Promise<{ valid: boolean; error?: string }> {
  const response = await fetch(`${API_BASE}/ocr/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(apiKey ? { apiKey } : {}),
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
