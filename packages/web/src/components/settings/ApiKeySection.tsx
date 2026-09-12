import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader2, Server, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiKeySource } from "@/services/api";

export type ApiKeyValidationState = "idle" | "validating" | "valid" | "invalid";

interface ApiKeySectionProps {
  inputKey: string;
  validationState: ApiKeyValidationState;
  validationError: string;
  keySource: ApiKeySource;
  keyHint: string | null;
  saving: boolean;
  clearing: boolean;
  hasKey: boolean;
  canValidate: boolean;
  onInputKeyChange: (value: string) => void;
  onSave: () => void;
  onValidate: () => void;
  onClear: () => void;
}

export function ApiKeySection({
  inputKey,
  validationState,
  validationError,
  keySource,
  keyHint,
  saving,
  clearing,
  hasKey,
  canValidate,
  onInputKeyChange,
  onSave,
  onValidate,
  onClear,
}: ApiKeySectionProps) {
  const { t } = useTranslation();

  const storedKeyPlaceholder = hasKey
    ? `${"*".repeat(16)}${keyHint ?? ""}`
    : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{t("settings.apiKey")}</Label>
        <div className="flex items-center gap-1.5">
          {hasKey && keySource === "server" && (
            <>
              <Server className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {t("settings.serverKey")}
              </span>
            </>
          )}
          {hasKey && keySource === "user" && (
            <span className="text-xs font-medium text-green-600">
              {t("settings.userKey")}
            </span>
          )}
          {!hasKey && (
            <span className="text-xs font-medium text-destructive">
              {t("settings.notConfigured")}
            </span>
          )}
        </div>
      </div>

      <Input
        type="password"
        placeholder={storedKeyPlaceholder ?? t("settings.apiKeyPlaceholder")}
        title={
          keyHint
            ? t("settings.apiKeyEndsWith", { hint: keyHint })
            : undefined
        }
        value={inputKey}
        onChange={(e) => onInputKeyChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter" && inputKey.trim()) {
            onSave();
          }
        }}
      />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving || !inputKey.trim()}
        >
          {saving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          {t("settings.saveKey")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onValidate}
          disabled={validationState === "validating" || !canValidate}
        >
          {validationState === "validating" && (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          )}
          {t("settings.validate")}
        </Button>
        {keySource === "user" && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onClear}
            disabled={clearing}
          >
            {clearing ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3 mr-1" />
            )}
            {t("settings.clearKey")}
          </Button>
        )}
        {validationState === "valid" && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            {t("settings.valid")}
          </span>
        )}
        {validationState === "invalid" && (
          <span className="flex items-center gap-1 text-sm text-destructive">
            <XCircle className="h-4 w-4" />
            {t("settings.invalid")}: {validationError}
          </span>
        )}
      </div>
    </div>
  );
}
