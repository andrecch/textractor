import { useDocumentStore } from "@/stores/documentStore";
import { FileUpload } from "@/components/upload/FileUpload";
import { DocumentViewer } from "@/components/document/DocumentViewer";
import { SectionPanel } from "@/components/section/SectionPanel";
import { OCRResultPanel } from "@/components/ocr/OCRResultPanel";
import { Separator } from "@/components/ui/separator";

export function ViewerPage() {
  const { document } = useDocumentStore();

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="w-full max-w-2xl">
          <FileUpload />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <SectionPanel />
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
