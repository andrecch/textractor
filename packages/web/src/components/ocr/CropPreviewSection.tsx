import { useTranslation } from "react-i18next";
import { RefreshCcw, Image as ImageIcon, ImageDown, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CropPreviewSectionProps {
  hasCroppedRaw: boolean;
  hasCroppedProcessed: boolean;
  imageCollapsed: boolean;
  currentImageSrc: string | null;
  hasCurrentImage: boolean;
  onToggleProcessed: () => void;
  onDownloadRaw: () => void;
  onDownloadProcessed: () => void;
  onToggleCollapse: () => void;
}

export function CropPreviewSection({
  hasCroppedRaw,
  hasCroppedProcessed,
  imageCollapsed,
  currentImageSrc,
  hasCurrentImage,
  onToggleProcessed,
  onDownloadRaw,
  onDownloadProcessed,
  onToggleCollapse,
}: CropPreviewSectionProps) {
  const { t } = useTranslation();

  return (
    <section className={`flex flex-col border-b overflow-hidden ${imageCollapsed ? "" : "flex-1"}`}>
      <div className="flex items-center justify-between p-2 border-b gap-2">
        <h3 className="text-base font-semibold">{t("ocr.imageCropTitle")}</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleProcessed}
            disabled={!hasCroppedRaw || !hasCroppedProcessed}
            title={t("ocr.toggleImage")}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDownloadRaw}
            disabled={!hasCroppedRaw}
            title={t("ocr.downloadRaw")}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDownloadProcessed}
            disabled={!hasCroppedProcessed}
            title={t("ocr.downloadProcessed")}
          >
            <ImageDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleCollapse}
            title={imageCollapsed ? t("ocr.expandImage") : t("ocr.collapseImage")}
          >
            {imageCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      {!imageCollapsed && (
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
      )}
    </section>
  );
}
