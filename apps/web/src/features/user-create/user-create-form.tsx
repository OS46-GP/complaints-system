import { useState } from "react";
import { useNavigate } from "react-router";
import { Save, X } from "lucide-react";

import { PATHS } from "@/router/paths";
import { Button } from "@/components/ui/button";
import { BasicInfoSection } from "@/features/user-create/basic-info-section";
import { OrganizationSection } from "@/features/user-create/organization-section";
import { PermissionsSection } from "@/features/user-create/permissions-section";
import type { UserCreateFormData } from "@/features/user-create/types";

const DEFAULT_DATA: UserCreateFormData = {
  fullName: "",
  employeeId: "",
  email: "",
  department: "",
  jobTitle: "",
  role: "employee",
  isActive: true,
};

interface UserCreateFormProps {
  onSubmit?: (data: UserCreateFormData) => Promise<void>;
  initialData?: Partial<UserCreateFormData>;
}

export function UserCreateForm({ onSubmit, initialData }: UserCreateFormProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<UserCreateFormData>({
    ...DEFAULT_DATA,
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (partial: Partial<UserCreateFormData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-stack-lg pb-12 mx-auto">
      <BasicInfoSection data={data} onChange={update} />
      <OrganizationSection data={data} onChange={update} />
      <PermissionsSection data={data} onChange={update} />

      <div className="flex items-center justify-end gap-stack-md pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(PATHS.ADMIN.USERS)}
          className="gap-2 h-11 px-8"
        >
          <X className="size-4" />
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2 h-11 px-10">
          <Save className="size-4" />
          {isSubmitting ? "جارٍ الحفظ..." : "حفظ المستخدم"}
        </Button>
      </div>
    </form>
  );
}
