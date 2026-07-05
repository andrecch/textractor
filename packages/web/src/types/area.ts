export interface AreaZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AreaStatus = "empty" | "zone-defined" | "processing" | "extracted" | "error";

export interface Area {
  id: string;
  name: string;
  documentName: string;
  pageIndex: number;
  zone: AreaZone | null;
  extractedText: string | null;
  status: AreaStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createDefaultArea(name: string, documentName: string): Area {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    documentName,
    pageIndex: 0,
    zone: null,
    extractedText: null,
    status: "empty",
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
  };
}
