import { UserPlus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { UserCreateFormData } from "@/features/user-create/types";

interface BasicInfoSectionProps {
  data: UserCreateFormData;
  onChange: (partial: Partial<UserCreateFormData>) => void;
}

export function BasicInfoSection({ data, onChange }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <UserPlus className="size-5" />
          البيانات الأساسية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
          <div className="space-y-3">
            <Label htmlFor="fullName">
              الاسم بالكامل
              <span className="text-destructive mr-0.5">*</span>
            </Label>
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder="مثال: محمد عبدالله الشمري"
              className="h-10"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="employeeId">
              الرقم الوظيفي
              <span className="text-destructive mr-0.5">*</span>
            </Label>
            <Input
              id="employeeId"
              value={data.employeeId}
              onChange={(e) => onChange({ employeeId: e.target.value })}
              placeholder="EMP-12345"
              className="h-10 font-mono"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="email">
              البريد الإلكتروني
              <span className="text-destructive mr-0.5">*</span>
            </Label>
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
