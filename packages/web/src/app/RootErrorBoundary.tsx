import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RootErrorBoundary() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const error = useRouteError();
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : null;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <TriangleAlert className="h-10 w-10 text-destructive" />
      <div className="space-y-1">
        <h1 className="text-xl font-bold">{t("errorBoundary.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("errorBoundary.message")}</p>
        {detail && import.meta.env.DEV ? (
          <p className="text-xs text-muted-foreground">{detail}</p>
        ) : null}
      </div>
      <Button onClick={() => navigate(0)}>{t("errorBoundary.retry")}</Button>
    </div>
  );
}
