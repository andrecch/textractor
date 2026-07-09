import { DEFAULT_OCR_MODEL } from "@/config/ocrModels";

export interface AppSettings {
  ocrEnabled: boolean;
  preprocessingEnabled: boolean;
  apiKey: string;
  language: "es" | "en";
  ocrModel: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  ocrEnabled: true,
  preprocessingEnabled: true,
  apiKey: "",
  language: "es",
  ocrModel: DEFAULT_OCR_MODEL,
};
