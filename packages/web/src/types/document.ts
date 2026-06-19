export type DocumentType = "pdf" | "image";

export interface DocumentFile {
  id: string;
  name: string;
  type: DocumentType;
  file: File;
  url: string;
  pageCount: number;
}
