import { Link } from "react-router";
import { Bell, Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useUnreadCount } from "@/features/notifications/hooks";
import { NotificationListContent } from "@/features/notifications/notification-list-content";
import { useAuthStore } from "@/features/auth/store";
import { PATHS } from "@/router/paths";

export function NotificationBell() {
  const { data } = useUnreadCount();
  const unread = data?.count ?? 0;
  const role = useAuthStore((s) => s.user?.role);
  const queryClient = useQueryClient();

  const notificationsPath =
    role === "SuperAdmin"
      ? PATHS.NOTIFICATIONS.SUPER_ADMIN
      : role === "Admin"
        ? PATHS.NOTIFICATIONS.ADMIN
        : PATHS.NOTIFICATIONS.USER;

  const handleOpenChange = (open: boolean) => {
    if (open) {
      queryClient.refetchQueries({ queryKey: ["notifications"] });
    }
  };

  return (
    <DropdownMenu dir="rtl" onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
          aria-label="الإشعارات"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] font-bold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="border-b px-3 py-2.5 text-sm font-semibold text-foreground">
          الإشعارات
        </DropdownMenuLabel>
        <div className="p-1.5">
          <NotificationListContent scrollClassName="max-h-80" />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="justify-center gap-1.5 py-2 text-sm font-medium"
        >
          <Link to={notificationsPath}>
            <Eye className="size-4" />
            عرض الكل
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}