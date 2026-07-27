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
      variant="destructive"
      className={cn("gap-2", className)}
      onClick={handleLogout}
    >
      <LogOut className="size-5" />
      <span>تسجيل الخروج</span>
    </Button>
  );
}
