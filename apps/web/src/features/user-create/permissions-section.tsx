import { ShieldCheck, UserCog, Shield, ShieldAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { UserCreateFormData } from "@/features/user-create/types";

interface PermissionsSectionProps {
  data: UserCreateFormData;
  onChange: (partial: Partial<UserCreateFormData>) => void;
}

const ROLE_OPTIONS: {
  value: string;
  icon: typeof UserCog;
  label: string;
}[] = [
  { value: "employee", icon: UserCog, label: "موظف" },
  { value: "supervisor", icon: Shield, label: "مشرف" },
  { value: "admin", icon: ShieldAlert, label: "مدير نظام" },
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
          الصلاحيات والأمان
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-stack-lg">
          <div className="space-y-3">
            <Label>
              الدور في النظام
              <span className="text-destructive mr-0.5">*</span>
            </Label>
            <RadioGroup
              value={data.role}
              onValueChange={(value) => onChange({ role: value })}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
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
          <div className="pt-6 border-t border-border/30 flex items-center justify-between">
            <div>
              <h4 className="font-heading text-body-lg font-semibold text-foreground">
                حالة الحساب
              </h4>
              <p className="text-muted-foreground font-body text-label-sm">
                تفعيل أو تعطيل دخول المستخدم للنظام فوراً.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span
                className={`font-heading text-label-sm font-medium transition-colors ${data.isActive ? "text-primary" : "text-foreground"}`}
              >
                {data.isActive ? "نشط" : "غير نشط"}
              </span>
              <Switch
                checked={data.isActive}
                onCheckedChange={(checked) => onChange({ isActive: checked })}
              />
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
