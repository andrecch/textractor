export interface AppSettings {
  ocrEnabled: boolean;
  preprocessingEnabled: boolean;
  apiKey: string;
  language: "es" | "en";
}

export const DEFAULT_SETTINGS: AppSettings = {
  ocrEnabled: true,
  preprocessingEnabled: true,
  apiKey: "",
  language: "es",
};
