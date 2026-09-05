import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { DEFAULT_OCR_MODEL, isValidOcrModel } from "@/config/ocrModels";

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: "textractor-settings",
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<SettingsState> | undefined;
        const settings = state?.settings;
        if (!settings || !isValidOcrModel(settings.ocrModel)) {
          return {
            ...(state ?? {}),
            settings: {
              ...DEFAULT_SETTINGS,
              ...(settings ?? {}),
              ocrModel: DEFAULT_OCR_MODEL,
            },
          } as SettingsState;
        }
        return state as SettingsState;
      },
    }
  )
);
