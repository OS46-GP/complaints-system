import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, KeyRound, User as UserIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/store";
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
} from "@/features/profile/hooks";

const profileSchema = z.object({
  fullName: z
    .string()
    .max(200, "الاسم الكامل يجب ألا يتجاوز 200 حرف"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: z
      .string()
      .min(6, "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ROLE_LABELS: Record<string, string> = {
  Admin: "مدير النظام",
  Official: "موظف",
};

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "" },
  });
  const { reset: resetProfileForm } = profileForm;

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (profile) {
      resetProfileForm({ fullName: profile.fullName ?? "" });
    }
  }, [profile, resetProfileForm]);

  const onProfileSubmit = (data: ProfileFormData) => {
    const fullName = data.fullName.trim();
    updateProfileMutation.mutate(
      { fullName: fullName || undefined },
      {
        onSuccess: (updated) => {
          if (user) {
            setUser({ ...user, ...updated });
          }
          toast.success("تم تحديث الملف الشخصي بنجاح");
        },
      },
    );
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("تم تغيير كلمة المرور بنجاح");
          passwordForm.reset();
        },
      },
    );
  };

  const displayName = profile?.fullName || user?.fullName || profile?.username || user?.username || "";
  const roleLabel = profile?.role ? ROLE_LABELS[profile.role] ?? profile.role : "";
  const initials = displayName.trim().slice(0, 2);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الملف الشخصي"
        description="إدارة بياناتك الشخصية وتغيير كلمة المرور"
      />

      <AsyncLoader
        loading={isLoading}
        error={isError}
        errorText="تعذر تحميل بيانات الملف الشخصي"
        onRetry={() => refetch()}
        skeleton={<FormSkeleton />}
      >
        <div className="flex flex-col gap-stack-lg">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar size="lg" className="size-14">
                  <AvatarFallback className="bg-primary/10 text-primary font-heading font-bold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{displayName}</CardTitle>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary">{roleLabel}</Badge>
                    <span className="text-xs text-muted-foreground">
                      @{profile?.username ?? user?.username}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <UserIcon className="size-4" />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-stack-lg md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <Input
                      id="username"
                      value={profile?.username ?? user?.username ?? ""}
                      disabled
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="nationalId">الرقم القومي</Label>
                    <Input
                      id="nationalId"
                      value={profile?.nationalId ?? ""}
                      disabled
                      dir="ltr"
                      placeholder=""
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <Input
                      id="fullName"
                      {...profileForm.register("fullName")}
                      placeholder="أدخل اسمك الكامل"
                      className="h-10"
                    />
                    {profileForm.formState.errors.fullName && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value=""
                      disabled
                      placeholder="غير متاح حالياً"
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="gap-2 h-11 px-8"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {updateProfileMutation.isPending
                      ? "جارٍ الحفظ..."
                      : "حفظ التغييرات"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <KeyRound className="size-4" />
                  تغيير كلمة المرور
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-stack-lg md:grid-cols-3">
                  <div className="space-y-3">
                    <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordForm.register("currentPassword")}
                      placeholder="••••••••"
                      className="h-10"
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register("newPassword")}
                      placeholder="6 أحرف على الأقل"
                      className="h-10"
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register("confirmPassword")}
                      placeholder="••••••••"
                      className="h-10"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="gap-2 h-11 px-8"
                  >
                    {changePasswordMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <KeyRound className="size-4" />
                    )}
                    {changePasswordMutation.isPending
                      ? "جارٍ التغيير..."
                      : "تغيير كلمة المرور"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </AsyncLoader>
    </div>
  );
}
