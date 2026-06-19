import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ViewerPage } from "@/pages/ViewerPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { SettingsPage } from "@/pages/SettingsPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <ViewerPage /> },
      { path: "/history", element: <HistoryPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);
