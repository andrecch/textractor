import { useTranslation } from "react-i18next";
import { ChevronDown, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OCR_MODELS } from "@/config/ocrModels";
import { cn } from "@/lib/utils";

interface ModelSectionProps {
  ocrModel: string;
  onSelectModel: (modelId: string) => void;
}

export function ModelSection({ ocrModel, onSelectModel }: ModelSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label>{t("settings.ocrModel")}</Label>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "data-[popup-open]:border-ring/50 data-[popup-open]:ring-1 data-[popup-open]:ring-ring/20"
          )}
        >
          <span>
            {OCR_MODELS.find((m) => m.id === ocrModel)?.name ??
              t("settings.ocrModel")}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--anchor-width)]">
          {OCR_MODELS.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onSelectModel(model.id)}
            >
              <span className="flex-1">{model.name}</span>
              {model.id === ocrModel && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-xs text-muted-foreground">
        {OCR_MODELS.find((m) => m.id === ocrModel)?.description}
      </p>
    </div>
  );
}
