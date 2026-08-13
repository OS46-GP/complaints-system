import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store";
import { PATHS } from "@/router/paths";

export function LogoutButton({ className }: { className?: string }) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate(PATHS.LOGIN, { replace: true });
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "gap-2 w-full justify-start text-sidebar-foreground",
        "hover:bg-transparent! hover:text-destructive active:bg-transparent!",
        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:rounded-lg",
        className,
      )}
      onClick={handleLogout}
    >
      <LogOut className="size-5" />
      <span className="group-data-[collapsible=icon]:hidden">تسجيل الخروج</span>
    </Button>
  );
}
