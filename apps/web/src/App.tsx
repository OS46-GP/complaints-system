import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import AppRouter from "./router";
import { queryClient } from "./lib/query-client";

import { ThemeProvider, useTheme } from "./components/shared/theme-provider";
import { TooltipProvider } from "./components/ui/tooltip";

function AppContent() {
  const { theme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster position="top-right" theme={theme} duration={4000} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider delayDuration={0}>
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  );
}
