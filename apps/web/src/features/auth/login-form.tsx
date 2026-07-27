import { useState } from "react";
import { Link } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

import { PATHS } from "@/router/paths";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useLogin } from "./use-auth";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
  remember: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label
          htmlFor="username"
          className="mb-3 text-right text-muted-foreground"
        >
          البريد الإلكتروني أو اسم المستخدم
        </Label>
        <div className="relative">
          <Mail className="absolute start-3 top-1/2 size-5 -translate-y-1/2 text-outline" />
          <Input
            id="username"
            type="text"
            placeholder="example@enterprise.com"
            className="h-11 ps-10 pe-3"
            autoFocus
            aria-invalid={errors.username ? true : undefined}
            {...register("username")}
          />
        </div>
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-muted-foreground">
            كلمة المرور
          </Label>
          <Link
            to={PATHS.FORGOT_PASSWORD}
            tabIndex={-1}
            className="font-heading text-label-sm text-primary hover:underline"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute start-3 top-1/2 size-5 -translate-y-1/2 text-outline" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="h-11 ps-10 pe-10"
            aria-invalid={errors.password ? true : undefined}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-outline hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Controller
        name="remember"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <Checkbox
              id="remember"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <Label htmlFor="remember" className="text-muted-foreground">
              تذكرني
            </Label>
          </div>
        )}
      />

      <Button
        type="submit"
        className="w-full h-12 gap-2"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <ArrowLeft className="size-5" />
        )}
        <span>
          {loginMutation.isPending ? "جاري التحميل..." : "تسجيل الدخول"}
        </span>
      </Button>
    </form>
  );
}
