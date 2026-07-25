import { Link, useNavigate } from "react-router";
import { ShieldOff, Home, Headset } from "lucide-react";

import { PATHS } from "@/router/paths";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="relative flex w-full max-w-2xl items-center justify-center overflow-hidden px-container-padding">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-primary-fixed-dim blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-secondary-container blur-[120px]" />
      </div>

      <div className="relative z-10 w-full text-center">
        <div className="rounded-xl border border-border/30 bg-white/80 p-12 shadow-sm backdrop-blur-md dark:bg-card/80">
          <div className="mb-stack-lg relative inline-block">
            <div className="absolute inset-0 mx-auto mb-6 size-24 rounded-full bg-destructive opacity-10 animate-ping" />
            <div className="relative mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-destructive/10 text-destructive-foreground">
              <ShieldOff className="size-12" />
            </div>
          </div>

          <h1 className="error-number-glitch mb-2 select-none font-mono text-[120px] font-bold leading-none text-primary">
            403
          </h1>

          <h2 className="mb-4 font-heading text-headline-md text-foreground">
            ليس لديك صلاحية الوصول لهذه الصفحة
          </h2>
          <p className="mx-auto mb-stack-lg max-w-md font-body text-body-md text-muted-foreground">
            نعتذر، ولكن يبدو أن حسابك لا يمتلك الأذونات الكافية لعرض هذا
            المحتوى. يرجى التواصل مع مسؤول النظام إذا كنت تعتقد أن هذا الخطأ لا
            يجب أن يظهر.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row">
            <Button asChild>
              <Link to={PATHS.LOGIN}>
                <Home className="size-5" />
                <span>العودة للرئيسية</span>
              </Link>
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <Headset className="size-5" />
              <span>اتصل بالدعم الفني</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
