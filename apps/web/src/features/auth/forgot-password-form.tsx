import { Mail, ArrowLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  return (
    <form noValidate>
      <div className="space-y-2">
        <Label htmlFor="email" className="mb-3 text-muted-foreground">
          البريد الإلكتروني
        </Label>
        <div className="relative">
          <Mail className="absolute start-3 top-1/2 size-5 -translate-y-1/2 text-outline" />
          <Input
            id="email"
            type="email"
            placeholder="example@enterprise.com"
            className="h-11 ps-10 pe-3"
          />
        </div>
      </div>

      <Button type="submit" className="mt-6 w-full h-12 gap-2">
        <span>إرسال رابط إعادة التعيين</span>
        <ArrowLeft className="size-5" />
      </Button>
    </form>
  );
}
