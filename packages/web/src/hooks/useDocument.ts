import { useCallback } from "react";
import { useDocumentStore } from "@/stores/documentStore";
import { useSectionStore } from "@/stores/sectionStore";
import type { DocumentFile } from "@/types/document";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function useDocument() {
  const { setDocument, clearDocument: clearDoc } = useDocumentStore();
  const { initializeForNewDocument } = useSectionStore();

  const loadDocument = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      const url = URL.createObjectURL(file);
      const isImage = IMAGE_TYPES.includes(file.type);

      let pageCount = 1;
      if (file.type === "application/pdf") {
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
      initializeForNewDocument();
    },
    [setDocument, initializeForNewDocument]
  );

  const clearDocument = useCallback(() => {
    clearDoc();
    useSectionStore.getState().clearSections();
  }, [clearDoc]);

  return { loadDocument, clearDocument };
}
