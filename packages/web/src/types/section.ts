export interface SectionRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SectionStatus = "empty" | "region-defined" | "processing" | "extracted" | "error";

export interface Section {
  id: string;
  name: string;
  pageIndex: number;
  region: SectionRegion | null;
  croppedImage: string | null;
  extractedText: string | null;
  status: SectionStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createDefaultSection(name: string): Section {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    pageIndex: 0,
    region: null,
    croppedImage: null,
    extractedText: null,
    status: "empty",
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
  };
}
