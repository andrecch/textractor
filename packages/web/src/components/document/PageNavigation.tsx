import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/stores/documentStore";

export function PageNavigation() {
  const { t } = useTranslation();
  const { document, currentPage, setPage } = useDocumentStore();

  if (!document || document.pageCount <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage <= 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        {t("viewer.page")} {currentPage + 1} {t("viewer.of")}{" "}
        {document.pageCount}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage >= document.pageCount - 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
