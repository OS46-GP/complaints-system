import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { CreateUserFormData } from "@/features/user-create/types";

interface BasicInfoSectionProps {
  data: CreateUserFormData;
  onChange: (partial: Partial<CreateUserFormData>) => void;
  errors?: Partial<Record<keyof CreateUserFormData, string>>;
}

export function BasicInfoSection({ data, onChange, errors }: BasicInfoSectionProps) {
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
              aria-invalid={!!errors?.username}
            />
            {errors?.username && (
              <p className="text-sm text-destructive">{errors.username}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="password">
              كلمة المرور
              <span className="text-destructive mr-0.5">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
              placeholder="••••••••"
              className="h-10"
              aria-invalid={!!errors?.password}
            />
            {errors?.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
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
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
