export interface OCRModel {
  id: string;
  name: string;
  description: string;
  recommended?: boolean;
}

export const OCR_MODELS: OCRModel[] = [
  {
    id: "nvidia/nemotron-ocr-v2",
    name: "Nemotron OCR v2",
    description: "Modelo OCR especializado de NVIDIA. Rapido y preciso para extraccion de texto.",
    recommended: true,
  },
  {
    id: "nvidia/llama-3.2-11b-vision-instruct",
    name: "Llama 3.2 11B Vision",
    description: "Modelo de vision general. Versatil para diversos tipos de contenido.",
  },
  {
    id: "nvidia/nemotron-parse",
    name: "Nemotron Parse",
    description: "Modelo de NVIDIA para parseo de documentos y extraccion de metadata.",
  },
];

export const DEFAULT_OCR_MODEL = "nvidia/nemotron-ocr-v2";

export function isValidOcrModel(modelId: string): boolean {
  return OCR_MODELS.some((m) => m.id === modelId);
}
