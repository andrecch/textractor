import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import i18n from "./i18n";
// @ts-ignore
import "./index.css";
import App from "./App";
import { useSettingsStore } from "@/stores/settingsStore";

function applyStoredLanguage(language: "es" | "en"): void {
  if (language !== i18n.language) {
    void i18n.changeLanguage(language);
  }
}

applyStoredLanguage(useSettingsStore.getState().settings.language);
useSettingsStore.persist.onFinishHydration((state) => {
  applyStoredLanguage(state.settings.language);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
