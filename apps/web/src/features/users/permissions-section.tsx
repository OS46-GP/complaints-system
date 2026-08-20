import { memo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ShieldCheck, UserCog, ShieldAlert, Crown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/features/auth/store";
import type { UserFormData } from "@/features/users/types";

interface PermissionsSectionProps {
  disabled?: boolean;
}

const ROLE_OPTIONS = {
  Official: { icon: UserCog, label: "موظف" },
  Admin: { icon: ShieldAlert, label: "مدير نظام" },
  SuperAdmin: { icon: Crown, label: "مدير النظام الأعلى" },
} as const;

export const PermissionsSection = memo(function PermissionsSection({
  disabled,
}: PermissionsSectionProps) {
  const { setValue } = useFormContext<UserFormData>();
  const currentRole = useAuthStore((s) => s.user?.role);
  const role = useWatch<{ role: UserFormData["role"] }>({ name: "role" }) ?? "Official";

  const availableRoles: (keyof typeof ROLE_OPTIONS)[] =
    currentRole === "SuperAdmin"
      ? ["Official", "Admin"]
      : ["Official"];

  const isDisabled = disabled || currentRole !== "SuperAdmin";

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
            value={role}
            onValueChange={(value) =>
              setValue("role", value as UserFormData["role"], {
                shouldValidate: false,
                shouldDirty: true,
              })
            }
            disabled={isDisabled}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {availableRoles.map((key) => {
              const option = ROLE_OPTIONS[key];
              const Icon = option.icon;
              return (
                <Label
                  key={key}
                  className={cn("cursor-pointer", isDisabled && "cursor-not-allowed")}
                >
                  <RadioGroupItem
                    value={key}
                    disabled={isDisabled}
                    className="peer sr-only"
                  />
                  <div className="w-full flex flex-col items-center justify-center p-3 border border-border rounded-lg transition-all text-muted-foreground peer-data-[state=checked]:bg-primary-container/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
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
});