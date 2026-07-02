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
  RefreshCcw,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAreaStore } from "@/stores/areaStore";
import { useOCRStore } from "@/stores/ocrStore";
import { useOCR } from "@/hooks/useOCR";
import { downloadPng, sanitizeFileName } from "@/services/imageExport";

export function OCRResultPanel() {
  const { t } = useTranslation();
  const { getActiveArea, activeAreaId } = useAreaStore();
  const { isProcessing } = useOCRStore();
  const { extractActive } = useOCR();
  const [copied, setCopied] = useState(false);
  const [showProcessed, setShowProcessed] = useState(false);

  const activeArea = getActiveArea();

  const buildImageFileName = (suffix: string) => {
    const zoneName = sanitizeFileName(activeArea?.name ?? "area");
    const docNameRaw = activeArea?.documentName ?? "document";
    const docNameNoExt = docNameRaw.replace(/\.[^.]+$/, "");
    const docNameTrunc = docNameNoExt.length > 20 ? docNameNoExt.slice(0, 20) : docNameNoExt;
    const docName = sanitizeFileName(docNameTrunc);
    const suffixPart = suffix ? `_${suffix}` : "";
    return `txtor_${zoneName}_${docName}${suffixPart}.png`;
  };

  const handleCopy = async () => {
    if (!activeArea?.extractedText) return;
    await navigator.clipboard.writeText(activeArea.extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    if (!activeArea?.extractedText) return;
    const blob = new Blob([activeArea.extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `textractor-${activeArea.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadRaw = () => {
    if (!activeArea?.croppedImageRaw) return;
    downloadPng(activeArea.croppedImageRaw, buildImageFileName("raw"));
  };

  const handleDownloadProcessed = () => {
    if (!activeArea?.croppedImageProcessed) return;
    downloadPng(
      activeArea.croppedImageProcessed,
      buildImageFileName("proc")
    );
  };

  const hasCroppedRaw = !!activeArea?.croppedImageRaw;
  const hasCroppedProcessed = !!activeArea?.croppedImageProcessed;
  const hasText = !!activeArea?.extractedText;

  const currentImageSrc = showProcessed
    ? activeArea?.croppedImageProcessed
    : activeArea?.croppedImageRaw;
  const hasCurrentImage = showProcessed ? hasCroppedProcessed : hasCroppedRaw;

  return (
    <div className="flex flex-col h-full">
      <section className="flex-1 flex flex-col border-b overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b gap-2">
          <h3 className="text-sm font-semibold">{t("ocr.imageCropTitle")}</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowProcessed((prev) => !prev)}
              disabled={!hasCroppedRaw || !hasCroppedProcessed}
              title={t("ocr.toggleImage")}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleDownloadRaw}
              disabled={!hasCroppedRaw}
              title={t("ocr.downloadRaw")}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleDownloadProcessed}
              disabled={!hasCroppedProcessed}
              title={t("ocr.downloadProcessed")}
            >
              <ImageDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-3 flex items-center justify-center">
          {hasCurrentImage ? (
            <img
              src={currentImageSrc ?? ""}
              alt="Crop preview"
              className="max-w-full h-auto rounded border bg-muted/30"
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              {t("ocr.noImage")}
            </p>
          )}
        </div>
      </section>

      <section className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b gap-2">
          <h3 className="text-sm font-semibold">{t("ocr.textRecognitionTitle")}</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={extractActive}
              disabled={isProcessing || !activeAreaId || !activeArea?.zone}
              title={t("ocr.extract")}
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
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
              className="h-7 w-7"
              onClick={handleExportTxt}
              disabled={!hasText}
              title={t("ocr.exportTxt")}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-3">
          {isProcessing ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("ocr.processing")}
              </div>
            </div>
          ) : activeArea?.status === "error" ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                {t("ocr.error")}: {activeArea.errorMessage}
              </div>
            </div>
          ) : !hasText ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground text-center">
                {t("ocr.noText")}
              </p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm">
              {activeArea.extractedText}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
}
