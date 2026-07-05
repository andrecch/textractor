import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getHistory, clearHistory, type HistoryResponse } from "@/services/api";

const PAGE_SIZE = 20;

interface HistoryRecord {
  id: string;
  documentName: string;
  sectionName: string;
  pageIndex: number;
  extractedText: string;
  provider: string;
  createdAt: string;
}

export function HistoryPanel() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      if (append) setLoadingMore(true);
      try {
        const data: HistoryResponse = await getHistory(PAGE_SIZE, offset);
        setTotal(data.total);
        setRecords((prev) =>
          append ? [...prev, ...data.records] : data.records
        );
      } catch {
        if (!append) setRecords([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPage(0, false);
  }, [fetchPage]);

  const handleClear = async () => {
    await clearHistory();
    setRecords([]);
    setTotal(0);
  };

  const handleLoadMore = () => {
    if (loadingMore) return;
    fetchPage(records.length, true);
  };

  const handleExport = (record: HistoryRecord) => {
    const blob = new Blob([record.extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `textractor-${record.sectionName}-${record.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">...</div>;
  }

  const hasMore = records.length < total;

  return (
    <div className="max-w-3xl mx-auto p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold">{t("history.title")}</h1>
          {total > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {records.length} / {total}
            </p>
          )}
        </div>
        {records.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4 mr-1" />
            {t("history.clear")}
          </Button>
        )}
      </div>

      {records.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {t("history.empty")}
        </p>
      ) : (
        <>
          <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-2">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{record.documentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.sectionName} · {t("history.page")} {record.pageIndex + 1} ·{" "}
                      {record.provider} ·{" "}
                      {new Date(record.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger>
                      <Button variant="ghost" size="sm">
                        {t("history.view")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {record.documentName} — {record.sectionName}
                        </DialogTitle>
                      </DialogHeader>
                      <pre className="whitespace-pre-wrap text-sm max-h-96 overflow-auto p-4 bg-muted rounded">
                        {record.extractedText}
                      </pre>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleExport(record)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-4 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ChevronLeft className="h-4 w-4 mr-1 animate-pulse" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                {t("history.loadMore", "Load more")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
