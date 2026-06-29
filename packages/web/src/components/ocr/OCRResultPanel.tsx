import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Copy,
  Check,
  Download,
  ImageDown,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSectionStore } from "@/stores/sectionStore";
import { useOCRStore } from "@/stores/ocrStore";
import { downloadPng, sanitizeFileName } from "@/services/imageExport";

export function OCRResultPanel() {
  const { t } = useTranslation();
  const { getActiveSection } = useSectionStore();
  const { isProcessing } = useOCRStore();
  const [copied, setCopied] = useState(false);

  const activeSection = getActiveSection();

  const buildImageFileName = (suffix: string) => {
    const baseName = activeSection?.name ?? "section";
    const page = (activeSection?.pageIndex ?? 0) + 1;
    return `textractor-${sanitizeFileName(baseName)}-p${page}-${suffix}.png`;
  };

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
    a.download = `textractor-${activeSection.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadRaw = () => {
    if (!activeSection?.croppedImageRaw) return;
    downloadPng(activeSection.croppedImageRaw, buildImageFileName("raw"));
  };

  const handleDownloadProcessed = () => {
    if (!activeSection?.croppedImageProcessed) return;
    downloadPng(
      activeSection.croppedImageProcessed,
      buildImageFileName("processed")
    );
  };

  const hasCroppedRaw = !!activeSection?.croppedImageRaw;
  const hasCroppedProcessed = !!activeSection?.croppedImageProcessed;
  const hasText = !!activeSection?.extractedText;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b gap-2">
        <h2 className="text-lg font-semibold shrink-0">{t("ocr.title")}</h2>
        <div className="flex gap-1 flex-wrap justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownloadRaw}
            disabled={!hasCroppedRaw}
            title={t("ocr.downloadRaw")}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownloadProcessed}
            disabled={!hasCroppedProcessed}
            title={t("ocr.downloadProcessed")}
          >
            <ImageDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
            disabled={!hasText}
            title={t("ocr.copy")}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleExportTxt}
            disabled={!hasText}
            title={t("ocr.exportTxt")}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isProcessing ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("ocr.processing")}
            </div>
          </div>
        ) : activeSection?.status === "error" ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              {t("ocr.error")}: {activeSection.errorMessage}
            </div>
          </div>
        ) : hasCroppedRaw && !hasText && activeSection ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {t("ocr.cropPreview")}
              </p>
              <div className="rounded border bg-muted/30 p-2 flex items-center justify-center">
                <img
                  src={activeSection.croppedImageRaw ?? ""}
                  alt="Crop preview"
                  className="max-w-full h-auto"
                />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-sm text-muted-foreground text-center">
                {t("ocr.zoneDefinedHint")}
              </p>
            </div>
          </div>
        ) : !hasText ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground text-center px-4">
              {t("ocr.empty")}
            </p>
          </div>
        ) : (
          <div className="p-4">
            <pre className="whitespace-pre-wrap text-sm">
              {activeSection.extractedText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
