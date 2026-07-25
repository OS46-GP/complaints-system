import {
  Globe,
  Building2,
  //  HelpCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";

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
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Globe className="size-5" />
        </Button>
        {/* <Button variant="ghost" size="icon" className="text-muted-foreground">
          <HelpCircle className="size-5" />
        </Button> */}
      </div>
    </header>
  );
}
