import { Building2 } from "lucide-react";

import { ModeToggle } from "@/components/shared/mode-toggle";

export function AuthHeader() {
  return (
    <header className="flex h-header-height w-full items-center justify-between border-b border-border bg-background px-container-padding">
      <div className="flex items-center gap-3">
        <Building2 className="size-8 text-primary" />
        <h1 className="font-heading text-display-lg text-primary">
          نظام إدارة الشكاوى
        </h1>
      </div>
      <div className="flex items-center gap-1">
        <ModeToggle />
      </div>
    </header>
  );
}
