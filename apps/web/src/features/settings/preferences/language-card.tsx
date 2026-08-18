import { List } from "lucide-react";

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
import type { Language } from "./types";

export function LanguageCard() {
  const { preferences, updatePreferences } = usePreferences();

  return (
    <SettingCard icon={List} title="اللغة">
      <div className="flex flex-col gap-3">
        <Label htmlFor="language">لغة الواجهة</Label>
        <Select
          dir="rtl"
          value={preferences.language}
          onValueChange={(value) =>
            updatePreferences({ language: value as Language })
          }
        >
          <SelectTrigger id="language" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ar">العربية</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SettingCard>
  );
}
