import { useState } from "react";
import { Link } from "react-router";
import { Lock, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";

import { PATHS } from "@/router/paths";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label
          htmlFor="identifier"
          className="mb-3 text-right text-muted-foreground"
        >
          البريد الإلكتروني أو اسم المستخدم
        </Label>
        <div className="relative">
          <Mail className="absolute start-3 top-1/2 size-5 -translate-y-1/2 text-outline" />
          <Input
            id="identifier"
            type="text"
            placeholder="example@enterprise.com"
            className="h-11 ps-10 pe-3"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-muted-foreground">
            كلمة المرور
          </Label>
          <Link
            to={PATHS.FORGOT_PASSWORD}
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
      </div>

      <div className="flex items-center gap-3 py-2">
        <Checkbox id="remember" />
        <Label htmlFor="remember" className="text-muted-foreground">
          تذكرني
        </Label>
      </div>

      <Button
        type="submit"
        className="flex h-12 w-full gap-2 bg-primary-container text-on-primary-container font-heading text-headline-md shadow-md hover:bg-primary"
      >
        <span>تسجيل الدخول</span>
        <ArrowLeft className="size-5" />
      </Button>
    </form>
  );
}
