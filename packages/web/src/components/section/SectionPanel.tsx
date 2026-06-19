import { useTranslation } from "react-i18next";
import { Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SectionItem } from "./SectionItem";
import { useSection } from "@/hooks/useSection";
import { useOCR } from "@/hooks/useOCR";

export function SectionPanel() {
  const { t } = useTranslation();
  const {
    sections,
    activeSectionId,
    setActiveSection,
    addSection,
    removeSection,
    renameSection,
  } = useSection();
  const { extractActive, isProcessing } = useOCR();

  return (
    <div className="flex flex-col h-full w-64 border-r bg-background">
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="text-sm font-semibold">{t("section.title")}</h2>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={addSection}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1">
        {sections.map((section) => (
          <SectionItem
            key={section.id}
            section={section}
            isActive={section.id === activeSectionId}
            onSelect={setActiveSection}
            onDelete={removeSection}
            onRename={renameSection}
          />
        ))}
      </div>

      <Separator />

      <div className="p-3">
        <Button
          className="w-full"
          onClick={extractActive}
          disabled={isProcessing || !activeSectionId}
        >
          <Play className="h-4 w-4 mr-2" />
          {t("section.extract")}
        </Button>
      </div>
    </div>
  );
}
