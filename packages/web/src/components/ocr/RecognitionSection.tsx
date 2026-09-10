import { useTranslation } from "react-i18next";
import { Copy, Check, Download, Loader2, AlertCircle, Square, Play, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Area } from "@/types/area";

interface RecognitionBodyProps {
  isProcessing: boolean;
  hasText: boolean;
  status: Area["status"] | null;
  errorMessage: string | null;
  extractedText: string | null;
}

function RecognitionBody({
  isProcessing,
  hasText,
  status,
  errorMessage,
  extractedText,
}: RecognitionBodyProps) {
  const { t } = useTranslation();

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("ocr.processing")}
        </div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          {t("ocr.error")}: {errorMessage}
        </div>
      </div>
    );
  }
  if (!hasText) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground text-center">
          {t("ocr.noText")}
        </p>
      </div>
    );
  }
  return (
    <pre className="whitespace-pre-wrap text-sm">
      {extractedText}
    </pre>
  );
}

interface RecognitionSectionProps {
  isProcessing: boolean;
  hasText: boolean;
  status: Area["status"] | null;
  errorMessage: string | null;
  extractedText: string | null;
  copied: boolean;
  canExtract: boolean;
  onToggleExtract: () => void;
  onCopy: () => void;
  onExportTxt: () => void;
  onRemoveBlankLines: () => void;
}

export function RecognitionSection({
  isProcessing,
  hasText,
  status,
  errorMessage,
  extractedText,
  copied,
  canExtract,
  onToggleExtract,
  onCopy,
  onExportTxt,
  onRemoveBlankLines,
}: RecognitionSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b gap-2">
        <h3 className="text-base font-semibold">{t("ocr.textRecognitionTitle")}</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${isProcessing ? "text-destructive hover:text-destructive" : ""}`}
            onClick={onToggleExtract}
            disabled={!isProcessing && !canExtract}
            title={isProcessing ? t("ocr.cancel") : t("ocr.extract")}
          >
            {isProcessing ? (
              <Square className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onRemoveBlankLines}
            disabled={!hasText || isProcessing}
            title={t("ocr.removeBlankLines")}
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onCopy}
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
            onClick={onExportTxt}
            disabled={!hasText}
            title={t("ocr.exportTxt")}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <RecognitionBody
          isProcessing={isProcessing}
          hasText={hasText}
          status={status}
          errorMessage={errorMessage}
          extractedText={extractedText}
        />
      </div>
    </section>
  );
}
