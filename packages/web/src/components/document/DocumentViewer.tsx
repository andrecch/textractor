import { useState, useCallback } from "react";
import { useDocumentStore } from "@/stores/documentStore";
import { PDFPageRenderer } from "./PDFPageRenderer";
import { ImageRenderer } from "./ImageRenderer";
import { PageNavigation } from "./PageNavigation";
import { ZoomControls } from "./ZoomControls";
import { SectionOverlay } from "@/components/section/SectionOverlay";

export function DocumentViewer() {
  const { document, currentPage, zoom } = useDocumentStore();
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

  const handlePageSizeChange = useCallback(
    (width: number, height: number) => {
      setPageSize({ width, height });
    },
    []
  );

  if (!document) return null;

  const rendererKey = `${document.id}-${currentPage}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <PageNavigation />
        <ZoomControls />
      </div>
      <div className="flex-1 overflow-auto p-4 bg-muted/30">
        <div
          className="relative inline-block"
          style={{ width: pageSize.width, height: pageSize.height }}
        >
          {document.type === "pdf" ? (
            <PDFPageRenderer
              key={rendererKey}
              url={document.url}
              pageIndex={currentPage}
              zoom={zoom}
              onPageSizeChange={handlePageSizeChange}
            />
          ) : (
            <ImageRenderer
              key={rendererKey}
              url={document.url}
              zoom={zoom}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
          <SectionOverlay
            width={pageSize.width}
            height={pageSize.height}
          />
        </div>
      </div>
    </div>
  );
}
