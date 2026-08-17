import { Link } from "react-router";
import { Bell } from "lucide-react";

import { PATHS } from "@/router/paths";
import { Button } from "@/components/ui/button";
import {
  NotificationsList,
  NotificationsListSkeleton,
} from "@/features/notifications/notification-list-content";
import { useNotifications } from "@/features/notifications/hooks";
import { useAuthStore } from "@/features/auth/store";

const DEFAULT_LIMIT = 5;

export function RecentNotifications({
  limit = DEFAULT_LIMIT,
}: {
  limit?: number;
}) {
  const role = useAuthStore((s) => s.user?.role);
  const { data: notifications, isLoading, isError } = useNotifications();

  const notificationsPath =
    role === "SuperAdmin"
      ? PATHS.NOTIFICATIONS.SUPER_ADMIN
      : PATHS.NOTIFICATIONS.ADMIN;

  const recent = (notifications ?? []).slice(0, limit);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-title-sm text-foreground">
          أحدث الإشعارات
        </h2>
        <Button asChild variant="ghost" size="sm">
          <Link to={notificationsPath}>عرض الكل</Link>
        </Button>
      </div>
      {isLoading ? (
        <NotificationsListSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
          <Bell className="size-8" />
          <p className="text-sm">تعذر تحميل الإشعارات</p>
        </div>
      ) : (
        <NotificationsList notifications={recent} />
      )}
    </section>
  );
}