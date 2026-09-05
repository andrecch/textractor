import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface OcrTogglesSectionProps {
  ocrEnabled: boolean;
  preprocessingEnabled: boolean;
  onToggleOcr: () => void;
  onTogglePreprocessing: () => void;
}

export function OcrTogglesSection({
  ocrEnabled,
  preprocessingEnabled,
  onToggleOcr,
  onTogglePreprocessing,
}: OcrTogglesSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between">
        <Label>{t("settings.ocrEnabled")}</Label>
        <Button
          variant={ocrEnabled ? "default" : "outline"}
          size="sm"
          onClick={onToggleOcr}
        >
          {ocrEnabled ? "ON" : "OFF"}
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
