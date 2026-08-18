import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/shared/theme-provider";
import {
  useFontSize,
} from "@/components/shared/font-size-provider";

import { AppearanceCard } from "./appearance-card";
import { FontSizeCard } from "./font-size-card";
import { LanguageCard } from "./language-card";
import { ComplaintListCard } from "./complaint-list-card";
import { DashboardCard } from "./dashboard-card";
import { NotificationsCard } from "./notifications-card";
import { usePreferences } from "./store";

export function PreferencesSection() {
  const { resetPreferences } = usePreferences();
  const { setTheme } = useTheme();
  const { setFontSize } = useFontSize();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <AppearanceCard />
      <FontSizeCard />
      <LanguageCard />
      <ComplaintListCard />
      <DashboardCard />
      <NotificationsCard />

      <div className="flex justify-end md:col-span-2 xl:col-span-3">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => {
            resetPreferences();
            setTheme("system");
            setFontSize("md");
          }}
        >
          <RotateCcw className="size-4" />
          استعادة الإعدادات الافتراضية
        </Button>
      </div>
    </div>
  );
}
