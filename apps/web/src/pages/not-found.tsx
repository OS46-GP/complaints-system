import {
  LayoutDashboard,
  ArrowLeft,
  Search,
  Headset,
  Flag,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { PATHS } from "@/router/paths";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative flex w-full max-w-2xl items-center justify-center overflow-hidden px-container-padding">
      <div className="relative z-10 w-full text-center">
        <div className="mb-stack-lg">
          <span className="block select-none text-[180px] font-bold leading-none tracking-tighter text-primary/10">
            404
          </span>
        </div>

        <div className="rounded-xl border border-border/30 bg-white/80 p-10 shadow-sm backdrop-blur-md dark:bg-card/80">
          <h1 className="mb-4 font-heading text-headline-md text-foreground">
            عذراً، الصفحة غير موجودة
          </h1>
          <p className="mx-auto mb-8 max-w-md font-body text-body-md text-muted-foreground">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها إلى رابط
            جديد.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild>
              <Link to={PATHS.LOGIN}>
                <LayoutDashboard className="size-5" />
                <span>العودة إلى لوحة القيادة</span>
              </Link>
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="size-5" />
              <span>رجوع للخلف</span>
            </Button>
          </div>
        </div>

        <div className="mt-stack-lg grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-border/20 bg-surface-container-low p-4 transition-colors hover:border-primary/40 group">
            <Search className="size-5 text-primary transition-transform group-hover:scale-110" />
            <span className="font-heading text-label-sm text-muted-foreground">
              البحث عن شكوى
            </span>
          </div>
          <div className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-border/20 bg-surface-container-low p-4 transition-colors hover:border-primary/40 group">
            <Headset className="size-5 text-primary transition-transform group-hover:scale-110" />
            <span className="font-heading text-label-sm text-muted-foreground">
              الدعم الفني
            </span>
          </div>
          <div className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-border/20 bg-surface-container-low p-4 transition-colors hover:border-primary/40 group">
            <Flag className="size-5 text-primary transition-transform group-hover:scale-110" />
            <span className="font-heading text-label-sm text-muted-foreground">
              الإبلاغ عن مشكلة
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
