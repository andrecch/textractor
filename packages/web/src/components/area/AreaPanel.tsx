import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaItem } from "./AreaItem";
import { useArea } from "@/hooks/useArea";

export function AreaPanel() {
  const { t } = useTranslation();
  const {
    areas,
    activeAreaId,
    setActiveArea,
    addArea,
    removeArea,
    renameArea,
  } = useArea();

  const [newAreaId, setNewAreaId] = useState<string | null>(null);
  const prevLengthRef = useRef(areas.length);

  useEffect(() => {
    if (areas.length > prevLengthRef.current) {
      setNewAreaId(areas[areas.length - 1].id);
    }
    prevLengthRef.current = areas.length;
  }, [areas]);

  return (
    <div className="flex flex-col h-full w-64 border-r bg-background">
      <div className="flex items-center justify-between p-2 border-b">
        <h2 className="text-base font-semibold">{t("area.title")}</h2>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={addArea}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1">
        {areas.map((area) => (
          <AreaItem
            key={area.id}
            area={area}
            isActive={area.id === activeAreaId}
            onSelect={setActiveArea}
            onDelete={removeArea}
            onRename={renameArea}
            autoEdit={area.id === newAreaId}
          />
        ))}
      </div>
    </div>
  );
}
