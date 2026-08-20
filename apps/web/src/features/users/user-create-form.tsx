import { useNavigate } from "react-router";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BasicInfoSection } from "@/features/users/basic-info-section";
import { PermissionsSection } from "@/features/users/permissions-section";
import { useCreateUser } from "@/features/users/hooks";
import { useUserManagementPaths } from "@/features/users/use-user-management-paths";
import type { UserFormData } from "@/features/users/types";

const schema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  email: z.string(),
  nationalId: z.string(),
  role: z.enum(["Official", "Admin", "SuperAdmin"]),
});

export function UserCreateForm() {
  const navigate = useNavigate();
  const { usersList } = useUserManagementPaths();
  const mutation = useCreateUser();

  const form = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      nationalId: "",
      role: "Official",
    },
  });

  const onSubmit = (formData: UserFormData) => {
    mutation.mutate(formData, {
      onSuccess: () => {
        toast.success("تم إنشاء المستخدم بنجاح");
        navigate(usersList);
      },
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-stack-lg pb-12 mx-auto">
        <BasicInfoSection />
        <PermissionsSection />

      <div className="flex items-center justify-end gap-stack-md pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(usersList)}
          className="gap-2 h-11 px-8"
        >
          <X className="size-4" />
          إلغاء
        </Button>
        <Button type="submit" disabled={mutation.isPending} className="gap-2 h-11 px-10">
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {mutation.isPending ? "جارٍ الحفظ..." : "حفظ المستخدم"}
        </Button>
      </div>
      </form>
    </FormProvider>
  );
}
