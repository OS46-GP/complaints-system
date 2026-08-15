import { Monitor, Moon, Sun } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useTheme } from "@/components/shared/theme-provider";

import { SettingCard } from "./setting-card";

export function AppearanceCard() {
  const { theme, setTheme } = useTheme();

  return (
    <SettingCard icon={Sun} title="المظهر">
      <RadioGroup
        dir="rtl"
        value={theme}
        onValueChange={(value) =>
          setTheme(value as "light" | "dark" | "system")
        }
        className="flex flex-wrap gap-x-6 gap-y-3"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="light" id="theme-light" />
          <Label htmlFor="theme-light" className="flex items-center gap-2">
            <Sun className="size-4" />
            فاتح
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="dark" id="theme-dark" />
          <Label htmlFor="theme-dark" className="flex items-center gap-2">
            <Moon className="size-4" />
            داكن
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="system" id="theme-system" />
          <Label htmlFor="theme-system" className="flex items-center gap-2">
            <Monitor className="size-4" />
            حسب النظام
          </Label>
        </div>
      </RadioGroup>
    </SettingCard>
  );
}
