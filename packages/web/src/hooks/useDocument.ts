import { useCallback } from "react";
import { useDocumentStore } from "@/stores/documentStore";
import { useAreaStore } from "@/stores/areaStore";
import type { DocumentFile } from "@/types/document";
import { pdfjsLib } from "@/services/pdfConfig";
import { clearAllPdfCaches } from "@/services/pdfCache";

const ACCEPTED_MIMES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

function getExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx === -1 ? "" : name.slice(idx).toLowerCase();
}

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_MIMES.has(file.type)) return true;
  const ext = getExtension(file.name);
  return ACCEPTED_EXTENSIONS.includes(ext);
}

function isImageFile(file: File): boolean {
  if (file.type === "application/pdf") return false;
  if (file.type.startsWith("image/")) return true;
  const ext = getExtension(file.name);
  return IMAGE_EXTENSIONS.includes(ext);
}

export class UnsupportedFileError extends Error {
  public readonly fileName: string;
  constructor(fileName: string) {
    super(`Unsupported file: ${fileName}`);
    this.name = "UnsupportedFileError";
    this.fileName = fileName;
  }
}

export function useDocument() {
  const { setDocument, clearDocument: clearDoc, document: currentDoc } = useDocumentStore();
  const { initializeForNewDocument } = useAreaStore();

  const loadDocument = useCallback(
    async (file: File) => {
      if (!isAcceptedFile(file)) {
        throw new UnsupportedFileError(file.name);
      }

      if (currentDoc?.url) {
        URL.revokeObjectURL(currentDoc.url);
      }

      clearAllPdfCaches();

      const url = URL.createObjectURL(file);
      const isImage = isImageFile(file);

      let pageCount = 1;
      const isPdf = file.type === "application/pdf" || getExtension(file.name) === ".pdf";
      if (isPdf) {
        const pdf = await pdfjsLib.getDocument(url).promise;
        pageCount = pdf.numPages;
        pdf.destroy();
      }

      const doc: DocumentFile = {
        id: crypto.randomUUID(),
        name: file.name,
        type: isImage ? "image" : "pdf",
        file,
        url,
        pageCount,
      };

      setDocument(doc);
      initializeForNewDocument(doc.name);
    },
    [setDocument, initializeForNewDocument, currentDoc]
  );

  const clearDocument = useCallback(() => {
    if (currentDoc?.url) {
      URL.revokeObjectURL(currentDoc.url);
    }
    clearAllPdfCaches();
    clearDoc();
    useAreaStore.getState().clearAreas();
  }, [clearDoc, currentDoc]);

  return { loadDocument, clearDocument };
}
