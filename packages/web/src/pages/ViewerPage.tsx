import { useDocumentStore } from "@/stores/documentStore";
import { WelcomeScreen } from "@/components/upload/WelcomeScreen";
import { DocumentViewer } from "@/components/document/DocumentViewer";
import { AreaPanel } from "@/components/area/AreaPanel";
import { OCRResultPanel } from "@/components/ocr/OCRResultPanel";
import { Separator } from "@/components/ui/separator";

export function ViewerPage() {
  const { document } = useDocumentStore();

  if (!document) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex h-full">
      <AreaPanel />
      <div className="flex-1 overflow-hidden">
        <DocumentViewer />
      </div>
      <Separator orientation="vertical" />
      <div className="w-80 overflow-hidden">
        <OCRResultPanel />
      </div>
    </div>
  );
}
