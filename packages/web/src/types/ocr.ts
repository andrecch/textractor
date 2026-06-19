export interface OCRProvider {
  readonly name: string;
  extractText(imageBase64: string, apiKey: string): Promise<string>;
  validateConnection(apiKey: string): Promise<boolean>;
}

export interface OCROptions {
  apiKey: string;
  preprocessingEnabled: boolean;
}

export interface ExtractionRecord {
  id: string;
  documentName: string;
  sectionName: string;
  pageIndex: number;
  zone: { x: number; y: number; width: number; height: number };
  extractedText: string;
  provider: string;
  createdAt: string;
}
