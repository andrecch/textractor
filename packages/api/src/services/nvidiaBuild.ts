const CHAT_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const CV_API_BASE = "https://ai.api.nvidia.com/v1/cv";
const DEFAULT_MODEL = "nvidia/nemotron-ocr-v2";
const CV_MODELS = ["nvidia/nemotron-ocr-v2"];
const OCR_TIMEOUT_MS = 60000;
const DEBUG_OCR = true;

interface CVResponse {
  data?: Array<{
    index: number;
    text_detections?: Array<{
      text_prediction?: { text?: string; confidence?: number };
      bounding_box?: { points?: Array<{ x: number; y: number }> };
    }>;
  }>;
}

export async function callNvidiaBuildVision(
  imageBase64: string,
  apiKey?: string,
  modelId?: string,
  signal?: AbortSignal
): Promise<string> {
  const finalApiKey = apiKey || process.env.NVIDIA_API_KEY;
  const finalModel = modelId || DEFAULT_MODEL;

  if (!finalApiKey) {
    throw new Error("No API key provided. Set NVIDIA_API_KEY in .env or provide it in the request.");
  }

  const isCVModel = CV_MODELS.includes(finalModel);
  const apiUrl = isCVModel
    ? `${CV_API_BASE}/${finalModel}`
    : CHAT_API_URL;

  const timeoutSignal = AbortSignal.timeout(OCR_TIMEOUT_MS);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  if (DEBUG_OCR) {
    const sizeKB = (new Blob([imageBase64]).size / 1024).toFixed(1);
    console.log(`[OCR-API] Calling NVIDIA API (model: ${finalModel}, endpoint: ${isCVModel ? "CV" : "Chat"}), image size: ${sizeKB} KB, timeout: ${OCR_TIMEOUT_MS}ms`);
  }
  const tStart = performance.now();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${finalApiKey}`,
  };
  if (isCVModel) {
    headers.Accept = "application/json";
  }

  const payload = isCVModel
    ? { input: [{ type: "image_url", url: imageBase64 }] }
    : {
        model: finalModel,
        messages: [
          {
            role: "system",
            content: "You are a strict OCR engine. Your ONLY task is to transcribe the exact text visible in the image. Rules: 1) Output ONLY the raw text from the image, nothing else. 2) Preserve the original line breaks and spacing. 3) Never add explanations, descriptions, greetings, or commentary. 4) Never start with phrases like 'Here is', 'Sure', 'Of course', 'Certainly', 'The text', 'Aquí tienes', 'Claro'. 5) Your first character MUST be the first character of the text in the image. 6) If the image has no text, output an empty string.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transcribe the text in this image. Output ONLY the exact text, preserving line breaks. No preamble.",
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0,
      };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: combinedSignal,
  });

  const tEnd = performance.now();
  if (DEBUG_OCR) {
    console.log(`[OCR-API] NVIDIA response: ${response.status} ${response.statusText} in ${((tEnd - tStart) / 1000).toFixed(1)}s`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
  }

  if (isCVModel) {
    const data = (await response.json()) as CVResponse;
    return extractTextFromCVResponse(data);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content ?? "";
  return cleanOcrResponse(raw);
}

function extractTextFromCVResponse(data: CVResponse): string {
  const detections = data?.data?.[0]?.text_detections ?? [];
  return detections
    .map((d) => d?.text_prediction?.text ?? "")
    .filter(Boolean)
    .join("\n");
}

const CONVERSATIONAL_PREFIX = /^(here(?:'s| is| are)?\s+(?:the|your|below)|here you go|sure[,.]?|of course[,.]?|certainly[,.]?|aqu[ií]\s+(?:tienes|está|te dejo|te muestro)|claro[,.]?|por supuesto[,.]?|d[ií]a:|the text (?:in the image )?is:?|the extracted text (?:is)?:?|extracted text:?|transcription:?|text:?)\b[^a-zA-Z0-9]*/i;

function cleanOcrResponse(text: string): string {
  return text.replace(CONVERSATIONAL_PREFIX, "").trim();
}

export async function validateNvidiaBuildKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const tinyPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    await callNvidiaBuildVision(tinyPng, apiKey);
    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("401") || message.includes("403")) {
      return { valid: false, error: "Invalid API key" };
    }
    if (err instanceof Error && err.name === "AbortError") {
      return { valid: false, error: "Request timed out" };
    }
    return { valid: false, error: message };
  }
}
