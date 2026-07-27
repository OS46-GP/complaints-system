import { Building2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { UserCreateFormData } from "@/features/user-create/types";

interface OrganizationSectionProps {
  data: UserCreateFormData;
  onChange: (partial: Partial<UserCreateFormData>) => void;
}

const DEPARTMENTS = [
  { value: "customer-service", label: "قسم خدمة العملاء" },
  { value: "legal", label: "الإدارة القانونية" },
  { value: "it", label: "قسم التقنية والتحول الرقمي" },
  { value: "hr", label: "الموارد البشرية" },
];

export function OrganizationSection({
  data,
  onChange,
}: OrganizationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Building2 className="size-5" />
          التنظيم الإداري
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
          <div className="space-y-3">
            <Label htmlFor="department">
              القسم
              <span className="text-destructive mr-0.5">*</span>
            </Label>
            <Select
              dir="rtl"
              value={data.department}
              onValueChange={(value) => onChange({ department: value })}
            >
              <SelectTrigger
                id="department"
                className="data-[size=default]:h-10 w-full"
              >
                <SelectValue placeholder="اختر القسم..." />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="jobTitle">
              المسمى الوظيفي
              <span className="text-destructive mr-0.5">*</span>
            </Label>
            <Input
              id="jobTitle"
              value={data.jobTitle}
              onChange={(e) => onChange({ jobTitle: e.target.value })}
              placeholder="مثال: أخصائي شكاوى"
              className="h-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
