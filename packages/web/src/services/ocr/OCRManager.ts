import type { OCRProvider } from "./OCRProvider";

export class OCRManager {
  private providers: Map<string, OCRProvider> = new Map();
  private activeProvider: string | null = null;

  registerProvider(provider: OCRProvider): void {
    this.providers.set(provider.name, provider);
    if (!this.activeProvider) {
      this.activeProvider = provider.name;
    }
  }

  setActiveProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`OCR provider "${name}" not registered`);
    }
    this.activeProvider = name;
  }

  getActiveProvider(): OCRProvider {
    if (!this.activeProvider) {
      throw new Error("No active OCR provider");
    }
    const provider = this.providers.get(this.activeProvider);
    if (!provider) {
      throw new Error(`OCR provider "${this.activeProvider}" not found`);
    }
    return provider;
  }

  async extractText(imageBase64: string, apiKey: string): Promise<string> {
    const provider = this.getActiveProvider();
    return provider.extractText(imageBase64, apiKey);
  }

  async validateConnection(apiKey: string): Promise<boolean> {
    const provider = this.getActiveProvider();
    return provider.validateConnection(apiKey);
  }

  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const ocrManager = new OCRManager();
