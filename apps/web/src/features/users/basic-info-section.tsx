import { memo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { UserFormData } from "@/features/users/types";

interface BasicInfoSectionProps {
  isEdit?: boolean;
  readOnly?: boolean;
}

export const BasicInfoSection = memo(function BasicInfoSection({
  isEdit,
  readOnly,
}: BasicInfoSectionProps) {
  const { setValue } = useFormContext<UserFormData>();
  const disabled = readOnly || isEdit;

  const username = useWatch<{ username: string }>({ name: "username" }) ?? "";
  const password = useWatch<{ password: string }>({ name: "password" }) ?? "";
  const email = useWatch<{ email: string }>({ name: "email" }) ?? "";
  const nationalId = useWatch<{ nationalId: string }>({ name: "nationalId" }) ?? "";

  const update = (field: keyof UserFormData, value: string) => {
    setValue(field, value as never, {
      shouldValidate: false,
      shouldDirty: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">البيانات الأساسية</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
          <div className="space-y-3">
            <Label htmlFor="username">
              اسم المستخدم
              <span className="text-destructive mr-0.5">*</span>
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => update("username", e.target.value)}
              placeholder="اسم المستخدم للنظام"
              className="h-10"
              disabled={disabled}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password">
              {isEdit ? "كلمة المرور الجديدة" : "كلمة المرور"}
              {!isEdit && <span className="text-destructive mr-0.5">*</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => update("password", e.target.value)}
              placeholder={isEdit ? "اتركه فارغاً إذا لم ترد التغيير" : "••••••••"}
              className="h-10"
              disabled={disabled}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@company.gov.sa"
              className="h-10"
              disabled={disabled}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="nationalId">الرقم القومي</Label>
            <Input
              id="nationalId"
              value={nationalId}
              onChange={(e) => update("nationalId", e.target.value)}
              placeholder="الرقم القومي (يُستخدم لاستعادة كلمة المرور)"
              className="h-10"
              dir="ltr"
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});