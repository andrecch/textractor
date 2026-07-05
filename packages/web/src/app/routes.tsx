import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

const ViewerPage = lazy(() =>
  import("@/pages/ViewerPage").then((m) => ({ default: m.ViewerPage }))
);
const HistoryPage = lazy(() =>
  import("@/pages/HistoryPage").then((m) => ({ default: m.HistoryPage }))
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      ...
    </div>
  );
}

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: withSuspense(<ViewerPage />) },
      { path: "/history", element: withSuspense(<HistoryPage />) },
      { path: "/settings", element: withSuspense(<SettingsPage />) },
    ],
  },
]);
