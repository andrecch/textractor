import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  ocrValidate,
  getApiKeyStatus,
  setApiKey,
  clearApiKey,
} from "@/services/api";
import type { ApiKeySource } from "@/services/api";
import { AppearanceSection } from "./AppearanceSection";
import { OcrTogglesSection } from "./OcrTogglesSection";
import { ModelSection } from "./ModelSection";
import { ApiKeySection, type ApiKeyValidationState } from "./ApiKeySection";

export function SettingsPanel() {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const { resolvedTheme, setTheme } = useTheme();

  const [inputKey, setInputKey] = useState("");
  const [validationState, setValidationState] = useState<ApiKeyValidationState>("idle");
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

  const handleInputKeyChange = (value: string) => {
    setInputKey(value);
    setValidationState("idle");
  };

  const hasKey = keySource !== "none";
  const canValidate = inputKey.trim().length > 0 || hasKey;

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">{t("settings.title")}</h1>

      <div className="space-y-6">
        <AppearanceSection
          resolvedTheme={resolvedTheme}
          language={settings.language}
          onThemeChange={(checked) => setTheme(checked ? "dark" : "light")}
          onLanguageChange={handleLanguageChange}
        />

        <Separator />

        <OcrTogglesSection
          ocrEnabled={settings.ocrEnabled}
          preprocessingEnabled={settings.preprocessingEnabled}
          onToggleOcr={() => updateSettings({ ocrEnabled: !settings.ocrEnabled })}
          onTogglePreprocessing={() =>
            updateSettings({
              preprocessingEnabled: !settings.preprocessingEnabled,
            })
          }
        />

        <ModelSection
          ocrModel={settings.ocrModel}
          onSelectModel={(modelId) => updateSettings({ ocrModel: modelId })}
        />

        <Separator />

        <ApiKeySection
          inputKey={inputKey}
          validationState={validationState}
          validationError={validationError}
          keySource={keySource}
          saving={saving}
          clearing={clearing}
          hasKey={hasKey}
          canValidate={canValidate}
          onInputKeyChange={handleInputKeyChange}
          onSave={handleSave}
          onValidate={handleValidate}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}
