import { ThemeProvider } from "next-themes";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/routes";

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
