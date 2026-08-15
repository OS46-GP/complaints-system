import { Outlet, Link } from "react-router";
import { HelpCircle } from "lucide-react";

import { ModeToggle } from "@/components/shared/mode-toggle";
import { Button } from "@/components/ui/button";
import { PATHS } from "@/router/paths";

export default function DefaultLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <header className="fixed top-0 z-50 flex h-header-height w-full items-center justify-between border-b border-border bg-background px-container-padding">
        <Link to={PATHS.LOGIN}>
          <h1 className="font-heading text-display-lg text-primary">
            نظام إدارة الشكاوى
          </h1>
        </Link>
        <div className="flex items-center gap-stack-lg">
          <Button variant="ghost" size="icon" className="text-primary hover:bg-muted">
            <HelpCircle className="size-5" />
          </Button>
          <ModeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center overflow-hidden pt-header-height">
        <Outlet />
      </main>

      <footer className="flex w-full flex-col items-center justify-between gap-4 border-t border-border bg-surface-container-lowest px-container-padding py-stack-md md:flex-row">
        <div className="flex flex-col items-center gap-stack-md md:flex-row">
          <h2 className="font-heading text-headline-md text-primary">
            نظام إدارة الشكاوى
          </h2>
          <span className="hidden text-border md:block">|</span>
          <p className="font-body text-label-sm text-muted-foreground">
            © ٢٠٢٤ نظام إدارة الشكاوى المؤسسي. جميع الحقوق محفوظة.
          </p>
        </div>
        <div className="flex items-center gap-stack-lg">
          <a
            href="#"
            className="font-body text-label-sm text-muted-foreground transition-colors hover:text-primary"
          >
            سياسة الخصوصية
          </a>
          <a
            href="#"
            className="font-body text-label-sm text-muted-foreground transition-colors hover:text-primary"
          >
            شروط الخدمة
          </a>
          <a
            href="#"
            className="font-body text-label-sm text-primary underline transition-colors hover:text-primary/80"
          >
            الدعم الفني
          </a>
        </div>
      </footer>
    </div>
  );
}
