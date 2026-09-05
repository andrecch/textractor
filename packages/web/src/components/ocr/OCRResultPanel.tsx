import { useState, useCallback } from "react";
import { useAreaStore } from "@/stores/areaStore";
import { useOCRStore } from "@/stores/ocrStore";
import { useOCR } from "@/hooks/useOCR";
import { useAreaImage } from "@/hooks/useAreaImage";
import { getAreaImage } from "@/stores/imageStore";
import { downloadPng, sanitizeFileName } from "@/services/imageExport";
import { CropPreviewSection } from "./CropPreviewSection";
import { RecognitionSection } from "./RecognitionSection";

export function OCRResultPanel() {
  const { getActiveArea, activeAreaId } = useAreaStore();
  const { isProcessing, cancelExtraction } = useOCRStore();
  const { extractActive } = useOCR();
  const [copied, setCopied] = useState(false);
  const [showProcessed, setShowProcessed] = useState(false);
  const [imageCollapsed, setImageCollapsed] = useState(false);

  const activeArea = getActiveArea();
  const croppedImageRaw = useAreaImage(activeAreaId, "raw");
  const croppedImageProcessed = useAreaImage(activeAreaId, "processed");

  const buildImageFileName = useCallback(
    (suffix: string) => {
      const zoneName = sanitizeFileName(activeArea?.name ?? "area");
      const docNameRaw = activeArea?.documentName ?? "document";
      const docNameNoExt = docNameRaw.replace(/\.[^.]+$/, "");
      const docNameTrunc = docNameNoExt.length > 20 ? docNameNoExt.slice(0, 20) : docNameNoExt;
      const docName = sanitizeFileName(docNameTrunc);
      const suffixPart = suffix ? `_${suffix}` : "";
      return `txtor_${zoneName}_${docName}${suffixPart}.png`;
    },
    [activeArea]
  );

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
    if (!activeAreaId) return;
    const img = getAreaImage(activeAreaId, "raw");
    if (!img) return;
    downloadPng(img, buildImageFileName("raw"));
  };

  const handleDownloadProcessed = () => {
    if (!activeAreaId) return;
    const img = getAreaImage(activeAreaId, "processed");
    if (!img) return;
    downloadPng(img, buildImageFileName("proc"));
  };

  const hasCroppedRaw = !!croppedImageRaw;
  const hasCroppedProcessed = !!croppedImageProcessed;
  const hasText = !!activeArea?.extractedText;

  const currentImageSrc = showProcessed ? croppedImageProcessed : croppedImageRaw;
  const hasCurrentImage = showProcessed ? hasCroppedProcessed : hasCroppedRaw;

  return (
    <div className="flex flex-col h-full">
      <CropPreviewSection
        hasCroppedRaw={hasCroppedRaw}
        hasCroppedProcessed={hasCroppedProcessed}
        imageCollapsed={imageCollapsed}
        currentImageSrc={currentImageSrc}
        hasCurrentImage={hasCurrentImage}
        onToggleProcessed={() => setShowProcessed((prev) => !prev)}
        onDownloadRaw={handleDownloadRaw}
        onDownloadProcessed={handleDownloadProcessed}
        onToggleCollapse={() => setImageCollapsed((prev) => !prev)}
      />
      <RecognitionSection
        isProcessing={isProcessing}
        hasText={hasText}
        status={activeArea?.status ?? null}
        errorMessage={activeArea?.errorMessage ?? null}
        extractedText={activeArea?.extractedText ?? null}
        copied={copied}
        canExtract={!!activeAreaId && !!activeArea?.zone}
        onToggleExtract={isProcessing ? cancelExtraction : extractActive}
        onCopy={handleCopy}
        onExportTxt={handleExportTxt}
      />
    </div>
  );
}
