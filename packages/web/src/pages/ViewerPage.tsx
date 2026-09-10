import { useDocumentStore } from "@/stores/documentStore";
import { WelcomeScreen } from "@/components/upload/WelcomeScreen";
import { DocumentViewer } from "@/components/document/DocumentViewer";
import { AreaPanel } from "@/components/area/AreaPanel";
import { OCRResultPanel } from "@/components/ocr/OCRResultPanel";
import { ResizeHandle } from "@/components/layout/ResizeHandle";
import { usePanelSize } from "@/hooks/usePanelSize";

export function ViewerPage() {
  const { document } = useDocumentStore();
  const areaPanel = usePanelSize("textractor.panel.area.width", {
    defaultWidth: 256,
    min: 180,
    max: 360,
  });
  const ocrPanel = usePanelSize("textractor.panel.ocr.width", {
    defaultWidth: 336,
    min: 280,
    max: 480,
  });

  if (!document) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex h-full">
      <AreaPanel width={areaPanel.width} />
      <ResizeHandle side="left" onResize={areaPanel.resizeBy} />
      <div className="flex-1 min-w-0 overflow-hidden">
        <DocumentViewer />
      </div>
      <ResizeHandle side="right" onResize={ocrPanel.resizeBy} />
      <div className="overflow-hidden shrink-0" style={{ width: ocrPanel.width }}>
        <OCRResultPanel />
      </div>
    </div>
  );
}
