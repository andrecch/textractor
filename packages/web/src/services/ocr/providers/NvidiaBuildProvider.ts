import type { OCRProvider } from "../OCRProvider";
import { ocrExtract, ocrValidate } from "@/services/api";

export class NvidiaBuildProvider implements OCRProvider {
  readonly name = "nvidia-build";

  async extractText(imageBase64: string, apiKey: string): Promise<string> {
    const result = await ocrExtract(imageBase64, apiKey);
    return result.text;
  }

  async validateConnection(apiKey: string): Promise<boolean> {
    const result = await ocrValidate(apiKey);
    return result.valid;
  }
}
