import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AsyncLoader } from "@/components/shared/async-loader";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { BasicInfoSection } from "@/features/users/basic-info-section";
import { PermissionsSection } from "@/features/users/permissions-section";
import { useUser, useUpdateUser } from "@/features/users/hooks";
import { useUserManagementPaths } from "@/features/users/use-user-management-paths";
import type { UserEditFormData } from "@/features/users/types";

interface UserEditFormProps {
  userId: string;
}

const schema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().or(z.literal("")),
  email: z.string(),
  nationalId: z.string(),
  role: z.enum(["Official", "Admin", "SuperAdmin"]),
});

export function UserEditForm({ userId }: UserEditFormProps) {
  const navigate = useNavigate();
  const { usersList } = useUserManagementPaths();
  const mutation = useUpdateUser(userId);

  const { data: existingUser, isLoading, isError, refetch } = useUser(userId);

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
  } = useForm<UserEditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      nationalId: "",
      role: "Official",
    },
  });

  useEffect(() => {
    if (existingUser) {
      reset({
        username: existingUser.username,
        password: "",
        email: existingUser.email ?? "",
        nationalId: existingUser.nationalId ?? "",
        role: existingUser.role,
      });
    }
  }, [existingUser, reset]);

  const data = watch();

  const update = (partial: Partial<UserEditFormData>) => {
    for (const [key, value] of Object.entries(partial)) {
      setValue(key as keyof UserEditFormData, value as never);
    }
  };

  const onSubmit = (formData: UserEditFormData) => {
    mutation.mutate(formData, {
      onSuccess: () => {
        toast.success("تم تحديث المستخدم بنجاح");
        navigate(usersList);
      },
    });
  };

  if (isLoading) {
    return <AsyncLoader loading skeleton={<FormSkeleton />} />;
  }

  if (isError) {
    return (
      <AsyncLoader
        error
        errorText="تعذر تحميل بيانات المستخدم"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-lg pb-12 mx-auto">
      <BasicInfoSection
        data={data}
        onChange={update}
        isEdit
      />
      <PermissionsSection data={data} onChange={update} />

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
          {mutation.isPending ? "جارٍ الحفظ..." : "تحديث المستخدم"}
        </Button>
      </div>
    </form>
  );
}
