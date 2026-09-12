import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface OcrTogglesSectionProps {
  autoExtractEnabled: boolean;
  preprocessingEnabled: boolean;
  onToggleAutoExtract: () => void;
  onTogglePreprocessing: () => void;
}

export function OcrTogglesSection({
  autoExtractEnabled,
  preprocessingEnabled,
  onToggleAutoExtract,
  onTogglePreprocessing,
}: OcrTogglesSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <Label>{t("settings.autoExtract")}</Label>
          <p className="text-xs text-muted-foreground">
            {t("settings.autoExtractHint")}
          </p>
        </div>
        <Button
          variant={autoExtractEnabled ? "default" : "outline"}
          size="sm"
          onClick={onToggleAutoExtract}
        >
          {autoExtractEnabled ? "ON" : "OFF"}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Label>{t("settings.preprocessing")}</Label>
        <Button
          variant={preprocessingEnabled ? "default" : "outline"}
          size="sm"
          onClick={onTogglePreprocessing}
        >
          {preprocessingEnabled ? "ON" : "OFF"}
        </Button>
      </div>
    </>
  );
}
