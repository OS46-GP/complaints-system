import { Toaster } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import AppRouter from "./router";
import { queryClient } from "./lib/query-client";

import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "./components/ui/tooltip";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider delayDuration={0}>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: "8px", fontSize: "14px" },
              success: { duration: 3000 },
              error: { duration: 5000 },
            }}
          />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
