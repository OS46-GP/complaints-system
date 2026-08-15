import { Type } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  FONT_SIZE_LABELS,
  FONT_SIZE_OPTIONS,
  useFontSize,
} from "@/components/shared/font-size-provider";

import { SettingCard } from "./setting-card";

export function FontSizeCard() {
  const { fontSize, setFontSize } = useFontSize();

  return (
    <SettingCard icon={Type} title="حجم الخط">
      <RadioGroup
        dir="rtl"
        value={fontSize}
        onValueChange={(value) => setFontSize(value as typeof fontSize)}
        className="flex flex-wrap gap-x-6 gap-y-3"
      >
        {FONT_SIZE_OPTIONS.map((size) => (
          <div key={size} className="flex items-center gap-2">
            <RadioGroupItem value={size} id={`font-size-${size}`} />
            <Label
              htmlFor={`font-size-${size}`}
              className="flex items-center gap-2"
            >
              <Type className="size-4" />
              {FONT_SIZE_LABELS[size]}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </SettingCard>
  );
}
