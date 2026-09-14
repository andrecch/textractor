export const loadViewerPage = () =>
  import("@/pages/ViewerPage").then((m) => ({ default: m.ViewerPage }));

export const loadHistoryPage = () =>
  import("@/pages/HistoryPage").then((m) => ({ default: m.HistoryPage }));

export const loadSettingsPage = () =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage }));

export const pagePreloaders: Record<string, () => Promise<unknown>> = {
  "/": loadViewerPage,
  "/history": loadHistoryPage,
  "/settings": loadSettingsPage,
};
