const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL_ID = "moonshotai/kimi-k2.6";

export async function callNvidiaBuildVision(
  imageBase64: string,
  apiKey?: string
): Promise<string> {
  const finalApiKey = apiKey || process.env.NVIDIA_API_KEY;

  if (!finalApiKey) {
    throw new Error("No API key provided. Set NVIDIA_API_KEY in .env or provide it in the request.");
  }

  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${finalApiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_ID,
      messages: [
        {
          role: "system",
          content: "You are an OCR engine. Output ONLY the exact text visible in the image. No explanations, no descriptions, no commentary. Your response must begin with the first character of the extracted text. Never start with words like 'here', 'here is', 'here you go', 'sure', 'of course', 'certainly', 'aquí', 'claro', 'por supuesto'. Just the raw extracted text.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "OCR: Extract and return ONLY the visible text from this image. Start your response directly with the first character of the text. No preamble, no explanation, no description.",
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
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content ?? "";
  return cleanOcrResponse(raw);
}

const CONVERSATIONAL_PREFIX = /^(here(?:'s| is| are)?\s+(?:the|your|below)|here you go|sure[,.]?|of course[,.]?|certainly[,.]?|aqu[ií]\s+(?:tienes|está|te dejo|te muestro)|claro[,.]?|por supuesto[,.]?|d[ií]a:)\b[^a-zA-Z0-9]*/i;

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
    return { valid: false, error: message };
  }
}
