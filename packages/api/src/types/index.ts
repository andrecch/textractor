export interface OCRRequest {
  imageBase64: string;
  apiKey: string;
}

export interface OCRResponse {
  text: string;
  provider: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ExtractionRow {
  id: string;
  document_name: string;
  section_name: string;
  page_index: number;
  zone_x: number;
  zone_y: number;
  zone_width: number;
  zone_height: number;
  extracted_text: string;
  provider: string;
  created_at: string;
}
