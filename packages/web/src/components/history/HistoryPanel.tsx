import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getHistory, clearHistory } from "@/services/api";

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

  const fetchHistory = async () => {
    try {
      const data = (await getHistory()) as HistoryRecord[];
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClear = async () => {
    await clearHistory();
    setRecords([]);
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

  return (
    <div className="max-w-3xl mx-auto p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold">{t("history.title")}</h1>
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
      )}
    </div>
  );
}
