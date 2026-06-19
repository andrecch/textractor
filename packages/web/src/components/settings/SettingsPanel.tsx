import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader2, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSettingsStore } from "@/stores/settingsStore";
import { ocrValidate, getApiKeyStatus } from "@/services/api";

type ValidationState = "idle" | "validating" | "valid" | "invalid";

export function SettingsPanel() {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [validationError, setValidationError] = useState("");
  const [serverKeyPreview, setServerKeyPreview] = useState("");
  const [serverHasKey, setServerHasKey] = useState(false);

  useEffect(() => {
    getApiKeyStatus().then(({ hasKey, preview }) => {
      setServerHasKey(hasKey);
      setServerKeyPreview(preview);
    });
  }, []);

  const handleValidate = async () => {
    const keyToValidate = settings.apiKey || (serverHasKey ? undefined : "");
    if (!keyToValidate && !serverHasKey) return;

    setValidationState("validating");
    try {
      if (settings.apiKey) {
        const result = await ocrValidate(settings.apiKey);
        if (result.valid) {
          setValidationState("valid");
        } else {
          setValidationState("invalid");
          setValidationError(result.error ?? "");
        }
      } else {
        setValidationState("valid");
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

  const isUsingServerKey = !settings.apiKey && serverHasKey;
  const displayValue = settings.apiKey
    ? settings.apiKey.substring(0, 15) + "***"
    : serverKeyPreview;

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">{t("settings.title")}</h1>

      <div className="space-y-6">
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

        <Separator />

        <div className="space-y-2">
          <Label>{t("settings.apiKey")}</Label>
          <Input
            type="text"
            placeholder={t("settings.apiKeyPlaceholder")}
            value={displayValue}
            readOnly
            className="bg-muted"
          />
          <Input
            type="password"
            placeholder={t("settings.apiKeyOverridePlaceholder")}
            value={settings.apiKey}
            onChange={(e) => {
              updateSettings({ apiKey: e.target.value });
              setValidationState("idle");
            }}
          />
          {isUsingServerKey && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Server className="h-3 w-3" />
              <span>{t("settings.usingServerKey")}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidate}
              disabled={validationState === "validating" || (!settings.apiKey && !serverHasKey)}
            >
              {validationState === "validating" && (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              )}
              {t("settings.validate")}
            </Button>
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
