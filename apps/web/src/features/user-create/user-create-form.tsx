import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Save, X, Loader2 } from "lucide-react";

import { PATHS } from "@/router/paths";
import { Button } from "@/components/ui/button";
import { BasicInfoSection } from "@/features/user-create/basic-info-section";
import { PermissionsSection } from "@/features/user-create/permissions-section";
import { usersApi } from "@/features/users/api";
import type { CreateUserFormData } from "@/features/user-create/types";

const createUserSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  email: z.string(),
  role: z.enum(["Official", "Admin"]),
});

export function UserCreateForm() {
  const navigate = useNavigate();
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      role: "Official",
    },
  });

  const data = watch();

  const update = (partial: Partial<CreateUserFormData>) => {
    for (const [key, value] of Object.entries(partial)) {
      setValue(key as keyof CreateUserFormData, value as never);
    }
  };

  const mutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      toast.success("تم إنشاء المستخدم بنجاح");
      navigate(PATHS.ADMIN.USERS);
    },
  });

  const onSubmit = (formData: CreateUserFormData) => {
    mutation.mutate({
      username: formData.username,
      password: formData.password,
      role: formData.role,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-lg pb-12 mx-auto">
      <BasicInfoSection data={data} onChange={update} />
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
  );
}
