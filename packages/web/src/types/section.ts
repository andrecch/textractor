export interface SectionZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SectionStatus = "empty" | "zone-defined" | "processing" | "extracted" | "error";

export interface Section {
  id: string;
  name: string;
  documentName: string;
  pageIndex: number;
  zone: SectionZone | null;
  croppedImageRaw: string | null;
  croppedImageProcessed: string | null;
  extractedText: string | null;
  status: SectionStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createDefaultSection(name: string, documentName: string): Section {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    documentName,
    pageIndex: 0,
    zone: null,
    croppedImageRaw: null,
    croppedImageProcessed: null,
    extractedText: null,
    status: "empty",
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
  };
}
