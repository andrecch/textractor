import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check, Download, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSectionStore } from "@/stores/sectionStore";
import { useOCRStore } from "@/stores/ocrStore";

export function OCRResultPanel() {
  const { t } = useTranslation();
  const { getActiveSection } = useSectionStore();
  const { isProcessing } = useOCRStore();
  const [copied, setCopied] = useState(false);

  const activeSection = getActiveSection();

  const handleCopy = async () => {
    if (!activeSection?.extractedText) return;
    await navigator.clipboard.writeText(activeSection.extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    if (!activeSection?.extractedText) return;
    const blob = new Blob([activeSection.extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracto-${activeSection.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{t("ocr.title")}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("ocr.processing")}
          </div>
        </div>
      </div>
    );
  }

  if (activeSection?.status === "error") {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{t("ocr.title")}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            {t("ocr.error")}: {activeSection.errorMessage}
          </div>
        </div>
      </div>
    );
  }

  if (!activeSection?.extractedText) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{t("ocr.title")}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center px-4">
            {t("ocr.empty")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">{t("ocr.title")}</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExportTxt}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="whitespace-pre-wrap text-sm">{activeSection.extractedText}</pre>
      </div>
    </div>
  );
}
