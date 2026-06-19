import { useCallback, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocument } from "@/hooks/useDocument";

export function FileUpload() {
  const { t } = useTranslation();
  const { loadDocument } = useDocument();
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      try {
        await loadDocument(file);
      } catch {
        alert("Unsupported file type. Please use PDF, PNG, JPG, or WEBP.");
      }
    },
    [loadDocument]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 cursor-pointer transition-colors",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      )}
    >
      <Upload className="h-12 w-12 text-muted-foreground" />
      <div className="text-center">
        <p className="text-lg font-medium">{t("upload.dropzone")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("upload.or")}{" "}
          <span className="text-primary underline">{t("upload.browse")}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {t("upload.accepted")}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
