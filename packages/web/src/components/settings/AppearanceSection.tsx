import { useTranslation } from "react-i18next";
import { Sun, Moon, ChevronDown, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SegmentedSwitch } from "./SegmentedSwitch";

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
        <SegmentedSwitch
          checked={resolvedTheme === "dark"}
          onCheckedChange={onThemeChange}
          leftContent={<Sun className="h-4 w-4" />}
          rightContent={<Moon className="h-4 w-4" />}
          aria-label={t("settings.darkMode")}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>{t("settings.language")}</Label>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={t("settings.language")}
            className={cn(
              "flex h-8 w-[140px] items-center justify-between gap-2 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "data-[popup-open]:border-ring/50 data-[popup-open]:ring-1 data-[popup-open]:ring-ring/20"
            )}
          >
            <span className="truncate">
              {language === "es" ? "Español" : "English"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onLanguageChange("es")}>
              <span className="flex-1">Español</span>
              {language === "es" && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLanguageChange("en")}>
              <span className="flex-1">English</span>
              {language === "en" && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
