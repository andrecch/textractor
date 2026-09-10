import { useState, useCallback, useRef } from "react";
import { useDocumentStore } from "@/stores/documentStore";
import { useAreaStore } from "@/stores/areaStore";
import { PDFPageRenderer } from "./PDFPageRenderer";
import { ImageRenderer } from "./ImageRenderer";
import { PageNavigation } from "./PageNavigation";
import { ZoomControls } from "./ZoomControls";
import { AreaOverlay } from "@/components/area/AreaOverlay";
import { usePanMode } from "@/hooks/usePanMode";

export function DocumentViewer() {
  const { document, currentPage, zoom, rotationByPage, rotateCW } =
    useDocumentStore();
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isPanActive, isPanning } = usePanMode(scrollContainerRef);

  const rotation = rotationByPage[currentPage] ?? 0;

  const handlePageSizeChange = useCallback(
    (width: number, height: number) => {
      setPageSize({ width, height });
    },
    []
  );

  const handleRotate = useCallback(() => {
    if (pageSize.width > 0 && pageSize.height > 0) {
      useAreaStore.getState().rotateZonesCW(currentPage, pageSize.height);
    }
    rotateCW(currentPage);
  }, [pageSize.height, pageSize.width, currentPage, rotateCW]);

  if (!document) return null;

  const rendererKey = `${document.id}-${currentPage}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <PageNavigation />
        <ZoomControls onRotate={handleRotate} />
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto p-4 bg-muted/30"
      >
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
              rotation={rotation}
              onPageSizeChange={handlePageSizeChange}
            />
          ) : (
            <ImageRenderer
              key={rendererKey}
              url={document.url}
              zoom={zoom}
              rotation={rotation}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
          <AreaOverlay
            width={pageSize.width}
            height={pageSize.height}
            isPanActive={isPanActive}
            isPanning={isPanning}
          />
        </div>
      </div>
    </div>
  );
}
