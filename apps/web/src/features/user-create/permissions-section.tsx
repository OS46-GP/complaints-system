import { ShieldCheck, UserCog, ShieldAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { CreateUserFormData } from "@/features/user-create/types";

interface PermissionsSectionProps {
  data: CreateUserFormData;
  onChange: (partial: Partial<CreateUserFormData>) => void;
}

const ROLE_OPTIONS: {
  value: "Official" | "Admin";
  icon: typeof UserCog;
  label: string;
}[] = [
  { value: "Official", icon: UserCog, label: "موظف" },
  { value: "Admin", icon: ShieldAlert, label: "مدير نظام" },
];

export function PermissionsSection({
  data,
  onChange,
}: PermissionsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ShieldCheck className="size-5" />
          الصلاحيات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label>
            الدور في النظام
            <span className="text-destructive mr-0.5">*</span>
          </Label>
          <RadioGroup
            value={data.role}
            onValueChange={(value) =>
              onChange({ role: value as "Official" | "Admin" })
            }
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {ROLE_OPTIONS.map((option) => (
              <Label key={option.value} className="cursor-pointer">
                <RadioGroupItem
                  value={option.value}
                  className="peer sr-only"
                />
                <div className="w-full flex flex-col items-center justify-center p-3 border border-border rounded-lg transition-all text-muted-foreground peer-data-[state=checked]:bg-primary-container/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary">
                  <option.icon className="size-5 mb-1" />
                  <span className="font-heading text-label-sm">
                    {option.label}
                  </span>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
