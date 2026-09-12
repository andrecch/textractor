import { DEFAULT_OCR_MODEL } from "@/config/ocrModels";

export interface AppSettings {
  autoExtractEnabled: boolean;
  preprocessingEnabled: boolean;
  language: "es" | "en";
  ocrModel: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoExtractEnabled: false,
  preprocessingEnabled: true,
  language: "es",
  ocrModel: DEFAULT_OCR_MODEL,
};
