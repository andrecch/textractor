import { useTranslation } from "react-i18next";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AppearanceSectionProps {
  resolvedTheme: string | undefined;
  language: "es" | "en";
  onThemeChange: (checked: boolean) => void;
  onLanguageChange: (lang: "es" | "en") => void;
}

export function AppearanceSection({
  resolvedTheme,
  language,
  onThemeChange,
  onLanguageChange,
}: AppearanceSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between">
        <Label>{t("settings.darkMode")}</Label>
        <div className="flex items-center gap-2">
          <Sun
            className={cn(
              "h-4 w-4 transition-opacity",
              resolvedTheme === "dark" ? "opacity-40" : "opacity-100"
            )}
          />
          <Switch
            checked={resolvedTheme === "dark"}
            onCheckedChange={onThemeChange}
            aria-label={t("settings.darkMode")}
          />
          <Moon
            className={cn(
              "h-4 w-4 transition-opacity",
              resolvedTheme === "dark" ? "opacity-100" : "opacity-40"
            )}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>{t("settings.language")}</Label>
        <div className="flex gap-2">
          <Button
            variant={language === "es" ? "default" : "outline"}
            size="sm"
            onClick={() => onLanguageChange("es")}
          >
            ES
          </Button>
          <Button
            variant={language === "en" ? "default" : "outline"}
            size="sm"
            onClick={() => onLanguageChange("en")}
          >
            EN
          </Button>
        </div>
      </div>
    </>
  );
}
