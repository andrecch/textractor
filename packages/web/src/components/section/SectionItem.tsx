import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Pencil, Check, X, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Section } from "@/types/section";

interface SectionItemProps {
  section: Section;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

const statusColors: Record<Section["status"], string> = {
  empty: "text-muted-foreground",
  "zone-defined": "text-blue-500",
  processing: "text-yellow-500",
  extracted: "text-green-500",
  error: "text-destructive",
};

export function SectionItem({
  section,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: SectionItemProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);

  const handleSaveRename = () => {
    if (editName.trim()) {
      onRename(section.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditName(section.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveRename();
    if (e.key === "Escape") handleCancelRename();
  };

  const statusKey = section.status.replace("-", "") as keyof typeof t extends string ? string : string;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border p-2 cursor-pointer transition-colors",
        isActive ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      )}
      onClick={() => !isEditing && onSelect(section.id)}
    >
      <Circle className={cn("h-3 w-3 fill-current", statusColors[section.status])} />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-1">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveRename();
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelRename();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{section.name}</p>
            <p className="text-xs text-muted-foreground">
              {t("viewer.page")} {section.pageIndex + 1} · {t(`section.status.${statusKey}`)}
            </p>
          </div>
          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(section.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
