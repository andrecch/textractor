import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { OnOffSwitch } from "./OnOffSwitch";

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
        <OnOffSwitch
          checked={autoExtractEnabled}
          onCheckedChange={onToggleAutoExtract}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <Label>{t("settings.preprocessing")}</Label>
        <OnOffSwitch
          checked={preprocessingEnabled}
          onCheckedChange={onTogglePreprocessing}
        />
      </div>
    </>
  );
}
