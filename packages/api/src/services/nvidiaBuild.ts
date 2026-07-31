const CHAT_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const CV_API_BASE = "https://ai.api.nvidia.com/v1/cv";
const DEFAULT_MODEL = "nvidia/nemotron-ocr-v2";
const CV_MODELS = ["nvidia/nemotron-ocr-v2"];
const CHAT_VLM_MODELS = ["nvidia/nemotron-nano-12b-v2-vl"];
const OCR_TIMEOUT_MS = 60000;
const DEBUG_OCR = true;

import { resolveApiKey } from "./settingsStore.js";
import {
  formatOCRDetections,
  type OCRTextDetection,
} from "./ocrLayout.js";

interface CVResponse {
  data?: Array<{
    index: number;
    text_detections?: Array<{
      text_prediction?: { text?: string; confidence?: number };
      bounding_box?: { points?: Array<{ x: number; y: number }> };
    }>;
  }>;
}

const VLM_SYSTEM_PROMPT = `You are a strict OCR engine. Output ONLY the exact text visible in the image.
Rules:
1) One visual line per output line, separated by a single \\n.
2) Preserve all words and punctuation within a line.
3) Never collapse, merge, reorder, or omit lines.
4) Never add explanations, descriptions, greetings, or commentary.
5) If a line is empty, output an empty line.
6) Your first character MUST be the first character of the first line.`;

const VLM_USER_PROMPT = "Transcribe every visible line separately. Each visual line becomes one output line. Use \\n between lines. No preamble.";

const GENERIC_SYSTEM_PROMPT = "You are a strict OCR engine. Your ONLY task is to transcribe the exact text visible in the image. Rules: 1) Output ONLY the raw text from the image, nothing else. 2) Preserve the original line breaks and spacing. 3) Never add explanations, descriptions, greetings, or commentary. 4) Never start with phrases like 'Here is', 'Sure', 'Of course', 'Certainly', 'The text', 'Aquí tienes', 'Claro'. 5) Your first character MUST be the first character of the text in the image. 6) If the image has no text, output an empty string.";

const GENERIC_USER_PROMPT = "Transcribe the text in this image. Output ONLY the exact text, preserving line breaks. No preamble.";

export async function callNvidiaBuildVision(
  imageBase64: string,
  apiKey?: string,
  modelId?: string,
  signal?: AbortSignal
): Promise<string> {
  const finalApiKey = apiKey || resolveApiKey();
  const finalModel = modelId || DEFAULT_MODEL;

  if (!finalApiKey) {
    throw new Error("No API key configured. Set NVIDIA_API_KEY in .env, or configure one from Settings.");
  }

  const isCVModel = CV_MODELS.includes(finalModel);
  const isChatVLM = CHAT_VLM_MODELS.includes(finalModel);
  const apiUrl = isCVModel
    ? `${CV_API_BASE}/${finalModel}`
    : CHAT_API_URL;

  const timeoutSignal = AbortSignal.timeout(OCR_TIMEOUT_MS);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  if (DEBUG_OCR) {
    const sizeKB = (new Blob([imageBase64]).size / 1024).toFixed(1);
    const endpoint = isCVModel ? "CV" : isChatVLM ? "VLM" : "Chat";
    console.log(`[OCR-API] Calling NVIDIA API (model: ${finalModel}, endpoint: ${endpoint}), image size: ${sizeKB} KB, timeout: ${OCR_TIMEOUT_MS}ms`);
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
            content: isChatVLM ? VLM_SYSTEM_PROMPT : GENERIC_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: isChatVLM ? VLM_USER_PROMPT : GENERIC_USER_PROMPT,
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

export function extractTextFromCVResponse(data: CVResponse): string {
  const detections: OCRTextDetection[] = (data?.data ?? []).flatMap(
    (item) =>
      item.text_detections?.map((detection) => ({
        text: detection.text_prediction?.text,
        boundingBox: detection.bounding_box,
      })) ?? []
  );
  return formatOCRDetections(detections);
}

const CONVERSATIONAL_PREFIX = /^(here(?:'s| is| are)?\s+(?:the|your|below)|here you go|sure[,.]?|of course[,.]?|certainly[,.]?|aqu[ií]\s+(?:tienes|está|te dejo|te muestro)|claro[,.]?|por supuesto[,.]?|d[ií]a:|the text (?:in the image )?is:?|the extracted text (?:is)?:?|extracted text:?|transcription:?|text:?)\b[^a-zA-Z0-9]*/i;

function cleanOcrResponse(text: string): string {
  return text.replace(CONVERSATIONAL_PREFIX, "").trim();
}

export async function validateNvidiaBuildKey(
  apiKey?: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const keyToValidate = apiKey || resolveApiKey();
    if (!keyToValidate) {
      return { valid: false, error: "No API key configured" };
    }
    const tinyPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    await callNvidiaBuildVision(tinyPng, keyToValidate);
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
