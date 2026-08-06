import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import AppRouter from "./router";
import { queryClient } from "./lib/query-client";

import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider, useTheme } from "./components/shared/theme-provider";
import { PreferencesProvider } from "./features/settings/preferences/store";

function ThemedToaster() {
  const { theme } = useTheme();

  return <Toaster position="top-right" theme={theme} />;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <PreferencesProvider>
        <TooltipProvider delayDuration={0}>
          <QueryClientProvider client={queryClient}>
            <AppRouter />
            <ThemedToaster />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </TooltipProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
