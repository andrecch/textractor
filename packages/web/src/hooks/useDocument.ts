import { useCallback } from "react";
import { useDocumentStore } from "@/stores/documentStore";
import { useSectionStore } from "@/stores/sectionStore";
import type { DocumentFile } from "@/types/document";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

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
  const { setDocument, clearDocument: clearDoc } = useDocumentStore();
  const { initializeForNewDocument } = useSectionStore();

  const loadDocument = useCallback(
    async (file: File) => {
      if (!isAcceptedFile(file)) {
        throw new UnsupportedFileError(file.name);
      }

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
    [setDocument, initializeForNewDocument]
  );

  const clearDocument = useCallback(() => {
    clearDoc();
    useSectionStore.getState().clearSections();
  }, [clearDoc]);

  return { loadDocument, clearDocument };
}
