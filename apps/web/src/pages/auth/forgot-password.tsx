import { Link } from "react-router";
import { Lock } from "lucide-react";

import { PATHS } from "@/router/paths";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPassword() {
  return (
    <div className="mx-gutter w-full max-w-[480px] space-y-6">
      <div className="rounded-xl border border-border bg-surface-container-lowest p-stack-lg shadow-[0_4px_12px_rgba(13,27,46,0.08)] md:p-12">
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-primary-container text-white dark:text-on-primary-container">
            <Lock className="size-8" />
          </div>
          <h2 className="font-heading text-headline-md text-foreground mb-2">
            نسيت كلمة المرور؟
          </h2>
          <p className="font-body text-body-md text-muted-foreground">
            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
          </p>
        </div>{" "}
        <ForgotPasswordForm />{" "}
        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="font-heading text-label-sm text-muted-foreground">
            تذكرت كلمة المرور؟
            <Link
              to={PATHS.LOGIN}
              className="mr-1 font-bold text-primary hover:underline"
            >
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
