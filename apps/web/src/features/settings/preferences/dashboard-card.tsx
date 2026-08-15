import { LayoutDashboard } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SettingCard } from "./setting-card";
import { usePreferences } from "./store";

export function DashboardCard() {
  const { preferences, updatePreferences } = usePreferences();

  return (
    <SettingCard icon={LayoutDashboard} title="لوحة المتابعة">
      <div className="flex flex-col gap-3">
        <Label htmlFor="dashboardRange">النطاق الزمني الافتراضي</Label>
        <Select
          dir="rtl"
          value={preferences.dashboard.dateRange}
          onValueChange={(value) =>
            updatePreferences({
              dashboard: {
                dateRange: value as "lastYear" | "currentMonth",
              },
            })
          }
        >
          <SelectTrigger id="dashboardRange" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastYear">السنة الماضية</SelectItem>
            <SelectItem value="currentMonth">الشهر الحالي</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SettingCard>
  );
}
