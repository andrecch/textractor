import { useTranslation } from "react-i18next";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/stores/documentStore";

export function ZoomControls() {
  const { t } = useTranslation();
  const { zoom, zoomIn, zoomOut, fitToScreen } = useDocumentStore();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={zoomOut}
        title={t("viewer.zoomOut")}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground w-14 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={zoomIn}
        title={t("viewer.zoomIn")}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={fitToScreen}
        title={t("viewer.fitToScreen")}
      >
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  );
}
