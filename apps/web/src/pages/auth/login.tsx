import { Lock } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export default function Login() {
  return (
    <div className="w-full max-w-[480px]">
      <div className="rounded-xl border border-border bg-surface-container-lowest p-stack-lg shadow-[0_4px_12px_rgba(13,27,46,0.08)] md:p-12">
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <Lock className="size-8" />
          </div>
          <h2 className="font-heading text-headline-md text-foreground mb-2">
            تسجيل الدخول للنظام
          </h2>
          <p className="font-body text-body-md text-muted-foreground">
            أدخل بياناتك للوصول إلى لوحة التحكم
          </p>
        </div>
        <LoginForm />{" "}
        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="font-heading text-label-sm text-muted-foreground">
            تواجه مشكلة في الدخول؟
            <a href="#" className="mr-1 font-bold text-primary hover:underline">
              تواصل مع الدعم الفني
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
