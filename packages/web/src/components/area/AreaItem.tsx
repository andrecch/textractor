import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Pencil, Check, X, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Area } from "@/types/area";

interface AreaItemProps {
  area: Area;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  autoEdit?: boolean;
}

const statusColors: Record<Area["status"], string> = {
  empty: "text-muted-foreground",
  "zone-defined": "text-blue-500",
  processing: "text-yellow-500",
  extracted: "text-green-500",
  error: "text-destructive",
};

export function AreaItem({
  area,
  isActive,
  onSelect,
  onDelete,
  onRename,
  autoEdit,
}: AreaItemProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(autoEdit ?? false);
  const [editName, setEditName] = useState(area.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (autoEdit) {
      setIsEditing(true);
    }
  }, [autoEdit]);

  const handleSaveRename = () => {
    if (editName.trim()) {
      onRename(area.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditName(area.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveRename();
    if (e.key === "Escape") handleCancelRename();
  }

  const statusKey = area.status.replace("-", "") as keyof typeof t extends string ? string : string;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border p-2 cursor-pointer transition-colors",
        isActive ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      )}
      onClick={() => !isEditing && onSelect(area.id)}
    >
      <Circle className={cn("h-3 w-3 fill-current", statusColors[area.status])} />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-1">
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onBlur={handleSaveRename}
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
            <p className="text-sm font-medium truncate">{area.name}</p>
            <p className="text-xs text-muted-foreground">
              {t("viewer.page")} {area.pageIndex + 1} · {t(`area.status.${statusKey}`)}
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
                onDelete(area.id);
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
