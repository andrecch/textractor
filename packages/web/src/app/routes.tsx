import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RootErrorBoundary } from "@/app/RootErrorBoundary";
import {
  loadHistoryPage,
  loadSettingsPage,
  loadViewerPage,
} from "@/app/pageLoaders";

const ViewerPage = lazy(loadViewerPage);
const HistoryPage = lazy(loadHistoryPage);
const SettingsPage = lazy(loadSettingsPage);

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
    errorElement: <RootErrorBoundary />,
    children: [
      { path: "/", element: withSuspense(<ViewerPage />) },
      { path: "/history", element: withSuspense(<HistoryPage />) },
      { path: "/settings", element: withSuspense(<SettingsPage />) },
    ],
  },
]);
