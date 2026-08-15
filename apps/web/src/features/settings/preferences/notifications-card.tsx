import { Bell } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { SettingCard } from "./setting-card";
import { usePreferences } from "./store";

export function NotificationsCard() {
  const { preferences, updatePreferences } = usePreferences();

  return (
    <SettingCard icon={Bell} title="الإشعارات">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="emailOnUpdate">إشعارات البريد الإلكتروني</Label>
          <p className="text-sm text-muted-foreground">
            إشعاري عند تحديث حالة الشكاوى الخاصة بي
          </p>
        </div>
        <Switch
          id="emailOnUpdate"
          checked={preferences.notifications.emailOnUpdate}
          onCheckedChange={(checked) =>
            updatePreferences({ notifications: { emailOnUpdate: checked } })
          }
        />
      </div>
    </SettingCard>
  );
}
