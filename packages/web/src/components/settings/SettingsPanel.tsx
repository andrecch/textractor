import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { CheckCircle, XCircle, Loader2, Server, Trash2, Sun, Moon, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  ocrValidate,
  getApiKeyStatus,
  setApiKey,
  clearApiKey,
} from "@/services/api";
import type { ApiKeySource } from "@/services/api";
import { OCR_MODELS } from "@/config/ocrModels";
import { cn } from "@/lib/utils";

type ValidationState = "idle" | "validating" | "valid" | "invalid";

export function SettingsPanel() {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const { resolvedTheme, setTheme } = useTheme();

  const [inputKey, setInputKey] = useState("");
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [validationError, setValidationError] = useState("");
  const [keySource, setKeySource] = useState<ApiKeySource>("none");
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const refreshStatus = useCallback(async () => {
    const status = await getApiKeyStatus();
    setKeySource(status.source);
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleSave = async () => {
    if (!inputKey.trim()) return;
    setSaving(true);
    setValidationState("idle");
    try {
      await setApiKey(inputKey.trim());
      setInputKey("");
      await refreshStatus();
      setValidationState("valid");
    } catch {
      setValidationState("invalid");
      setValidationError("Failed to save API key");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    setValidationState("idle");
    try {
      await clearApiKey();
      await refreshStatus();
    } catch {
      // silently fail
    } finally {
      setClearing(false);
    }
  };

  const handleValidate = async () => {
    setValidationState("validating");
    try {
      const keyToValidate = inputKey.trim() || undefined;
      const result = await ocrValidate(keyToValidate);
      if (result.valid) {
        setValidationState("valid");
      } else {
        setValidationState("invalid");
        setValidationError(result.error ?? "");
      }
    } catch {
      setValidationState("invalid");
      setValidationError("Connection failed");
    }
  };

  const handleLanguageChange = (lang: "es" | "en") => {
    updateSettings({ language: lang });
    i18n.changeLanguage(lang);
  };

  const hasKey = keySource !== "none";
  const canValidate = inputKey.trim().length > 0 || hasKey;

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">{t("settings.title")}</h1>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>{t("settings.darkMode")}</Label>
          <div className="flex items-center gap-2">
            <Sun
              className={cn(
                "h-4 w-4 transition-opacity",
                resolvedTheme === "dark" ? "opacity-40" : "opacity-100"
              )}
            />
            <Switch
              checked={resolvedTheme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
              aria-label={t("settings.darkMode")}
            />
            <Moon
              className={cn(
                "h-4 w-4 transition-opacity",
                resolvedTheme === "dark" ? "opacity-100" : "opacity-40"
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label>{t("settings.language")}</Label>
          <div className="flex gap-2">
            <Button
              variant={settings.language === "es" ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageChange("es")}
            >
              ES
            </Button>
            <Button
              variant={settings.language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageChange("en")}
            >
              EN
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Label>{t("settings.ocrEnabled")}</Label>
          <Button
            variant={settings.ocrEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => updateSettings({ ocrEnabled: !settings.ocrEnabled })}
          >
            {settings.ocrEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Label>{t("settings.preprocessing")}</Label>
          <Button
            variant={settings.preprocessingEnabled ? "default" : "outline"}
            size="sm"
            onClick={() =>
              updateSettings({
                preprocessingEnabled: !settings.preprocessingEnabled,
              })
            }
          >
            {settings.preprocessingEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="space-y-2">
          <Label>{t("settings.ocrModel")}</Label>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "data-[popup-open]:border-ring/50 data-[popup-open]:ring-1 data-[popup-open]:ring-ring/20"
              )}
            >
              <span>
                {OCR_MODELS.find((m) => m.id === settings.ocrModel)?.name ??
                  t("settings.ocrModel")}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--anchor-width)]">
              {OCR_MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => updateSettings({ ocrModel: model.id })}
                >
                  <span className="flex-1">{model.name}</span>
                  {model.id === settings.ocrModel && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="text-xs text-muted-foreground">
            {OCR_MODELS.find((m) => m.id === settings.ocrModel)?.description}
          </p>
        </div>

        <Separator />

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
            placeholder={t("settings.apiKeyPlaceholder")}
            value={inputKey}
            onChange={(e) => {
              setInputKey(e.target.value);
              setValidationState("idle");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputKey.trim()) {
                handleSave();
              }
            }}
          />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !inputKey.trim()}
            >
              {saving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              {t("settings.saveKey")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidate}
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
                onClick={handleClear}
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
      </div>
    </div>
  );
}
