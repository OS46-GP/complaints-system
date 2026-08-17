import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Fingerprint, BadgeCheck, Loader2 } from "lucide-react";

import { PATHS } from "@/router/paths";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/features/users/api";

export function ForgotPasswordForm() {
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = nationalId.trim();
    if (!value) {
      setError("يرجى إدخال الرقم القومي");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await usersApi.requestPasswordReset(value);
      setSubmitted(true);
    } catch {
      setError("لا يوجد حساب مرتبط بهذا الرقم القومي");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <BadgeCheck className="mx-auto size-12 text-primary" />
        <p className="font-heading text-body-md font-bold text-foreground">
          تم استلام طلبك بنجاح
        </p>
        <p className="text-body-sm text-muted-foreground">
          سيعاد تعيين كلمة المرور قريباً بعد موافقة الإدارة، وستصلك إشعاراً
          بمجرد اكتمال العملية.
        </p>
        <Link
          to={PATHS.LOGIN}
          className="block font-bold text-primary hover:underline"
        >
          العودة لتسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2">
      <div className="space-y-2">
        <Label htmlFor="nationalId" className="mb-3 text-muted-foreground">
          الرقم القومي
        </Label>
        <div className="relative">
          <Fingerprint className="absolute start-3 top-1/2 size-5 -translate-y-1/2 text-outline" />
          <Input
            id="nationalId"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder="الرقم القومي المرتبط بحسابك"
            className="h-11 ps-10 pe-3 text-right"
            dir="rtl"
            aria-invalid={!!error}
          />
        </div>
        <p className="text-body-sm text-muted-foreground">
          يُرسل الطلب إلى الإدارة للموافقة عليه قبل إعادة تعيين كلمة المرور.
        </p>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <Button type="submit" className="mt-6 w-full h-12 gap-2" disabled={loading}>
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <span>إرسال طلب إعادة التعيين</span>
        )}
      </Button>
    </form>
  );
}