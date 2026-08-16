import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { UserFormData } from "@/features/users/types";

interface BasicInfoSectionProps {
  data: UserFormData;
  onChange: (partial: Partial<UserFormData>) => void;
  isEdit?: boolean;
  readOnly?: boolean;
}

export function BasicInfoSection({
  data,
  onChange,
  isEdit,
  readOnly,
}: BasicInfoSectionProps) {
  const disabled = readOnly || isEdit;

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
              value={data.username}
              onChange={(e) => onChange({ username: e.target.value })}
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
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
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
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="name@company.gov.sa"
              className="h-10"
              disabled={disabled}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="nationalId">الرقم القومي</Label>
            <Input
              id="nationalId"
              value={data.nationalId}
              onChange={(e) => onChange({ nationalId: e.target.value })}
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
}