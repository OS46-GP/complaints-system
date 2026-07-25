import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <Button variant="destructive" className={cn("gap-2", className)}>
      <LogOut className="size-5" />
      <span>تسجيل الخروج</span>
    </Button>
  );
}
