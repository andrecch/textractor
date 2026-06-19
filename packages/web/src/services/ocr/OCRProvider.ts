export interface OCRProvider {
  readonly name: string;
  extractText(imageBase64: string, apiKey: string): Promise<string>;
  validateConnection(apiKey: string): Promise<boolean>;
}
