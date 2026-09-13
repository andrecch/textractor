import { useTranslation } from "react-i18next";
import { Download, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CropPreviewSectionProps {
  hasCroppedRaw: boolean;
  hasCroppedProcessed: boolean;
  imageCollapsed: boolean;
  showProcessed: boolean;
  currentImageSrc: string | null;
  hasCurrentImage: boolean;
  onToggleProcessed: () => void;
  onDownloadCurrent: () => void;
  onToggleCollapse: () => void;
}

function ProcessedViewIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 8h.01" />
      <path d="M12 21h-6a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6" />
      <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l3.993 3.993" />
      <path d="M14 14l1 -1c.47 -.452 .995 -.675 1.52 -.67" />
      <path d="M19 22.5a4.75 4.75 0 0 1 3.5 -3.5a4.75 4.75 0 0 1 -3.5 -3.5a4.75 4.75 0 0 1 -3.5 3.5a4.75 4.75 0 0 1 3.5 3.5" />
    </svg>
  );
}

function OriginalViewIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 8h.01" />
      <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" />
      <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
      <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
    </svg>
  );
}

export function CropPreviewSection({
  hasCroppedRaw,
  hasCroppedProcessed,
  imageCollapsed,
  showProcessed,
  currentImageSrc,
  hasCurrentImage,
  onToggleProcessed,
  onDownloadCurrent,
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
            title={showProcessed ? t("ocr.showOriginal") : t("ocr.showProcessed")}
          >
            {showProcessed ? (
              <OriginalViewIcon className="h-4 w-4" />
            ) : (
              <ProcessedViewIcon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDownloadCurrent}
            disabled={!hasCurrentImage}
            title={t("ocr.downloadCurrent")}
          >
            <Download className="h-4 w-4" />
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
