import { ShieldCheck, UserCog, ShieldAlert, Crown } from "lucide-react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/features/auth/store";
import type { UserFormData } from "@/features/users/types";

interface PermissionsSectionProps {
  data: UserFormData;
  onChange: (partial: Partial<UserFormData>) => void;
}

const ROLE_OPTIONS = {
  Official: { icon: UserCog, label: "موظف" },
  Admin: { icon: ShieldAlert, label: "مدير نظام" },
  SuperAdmin: { icon: Crown, label: "مدير النظام الأعلى" },
} as const;

export function PermissionsSection({
  data,
  onChange,
}: PermissionsSectionProps) {
  const currentRole = useAuthStore((s) => s.user?.role);

  const availableRoles: (keyof typeof ROLE_OPTIONS)[] =
    currentRole === "SuperAdmin"
      ? ["Official", "Admin", "SuperAdmin"]
      : ["Official"];

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
              onChange({ role: value as UserFormData["role"] })
            }
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {availableRoles.map((key) => {
              const option = ROLE_OPTIONS[key];
              const Icon = option.icon;
              return (
                <Label key={key} className="cursor-pointer">
                  <RadioGroupItem value={key} className="peer sr-only" />
                  <div className="w-full flex flex-col items-center justify-center p-3 border border-border rounded-lg transition-all text-muted-foreground peer-data-[state=checked]:bg-primary-container/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary">
                    <Icon className="size-5 mb-1" />
                    <span className="font-heading text-label-sm">
                      {option.label}
                    </span>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
