import { toast } from "sonner";
import { Bell, KeyRound, Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useNotifications,
  useMarkRead,
  useApprovePasswordReset,
  useRejectPasswordReset,
} from "@/features/notifications/hooks";
import type { NotificationItem } from "@/features/notifications/api";
import { Skeleton } from "@/components/ui/skeleton";

function NotificationRow({
  notification,
}: {
  notification: NotificationItem;
}) {
  const markRead = useMarkRead();
  const approve = useApprovePasswordReset();
  const reject = useRejectPasswordReset();

  const isResetRequest = notification.type === "PASSWORD_RESET_REQUEST";
  const isPending =
    approve.isPending || reject.isPending || markRead.isPending;

  const time = notification.createdAt
    ? new Date(notification.createdAt).toLocaleString("ar-EG")
    : "";

  const handleOpen = () => {
    if (!notification.readAt) {
      markRead.mutate(notification.id);
    }
  };

  return (
    <div
      onClick={handleOpen}
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        notification.readAt
          ? "bg-surface-container-low/40 border-border"
          : "bg-surface-container-low border-primary/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isResetRequest ? (
            <KeyRound className="size-4 shrink-0 text-primary" />
          ) : (
            <Bell className="size-4 shrink-0 text-primary" />
          )}
          <p className="font-heading text-body-md font-bold text-foreground truncate">
            {notification.title}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!notification.readAt && (
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              غير مقروء
            </span>
          )}
          {time && (
            <span className="text-[0.6875rem] text-muted-foreground shrink-0">
              {time}
            </span>
          )}
        </div>
      </div>
      <p className="text-body-sm text-muted-foreground mt-1">{notification.body}</p>

      {isResetRequest && (
        <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            className="gap-1"
            disabled={isPending}
            onClick={() =>
              approve.mutate(notification.resourceId!, {
                onSuccess: () => {
                  toast.success("تمت إعادة تعيين كلمة المرور بنجاح");
                  markRead.mutate(notification.id);
                },
                onError: () => toast.error("تعذر إعادة تعيين كلمة المرور"),
              })
            }
          >
            <Check className="size-4" />
            موافقة
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-destructive"
            disabled={isPending}
            onClick={() =>
              reject.mutate(notification.resourceId!, {
                onSuccess: () => {
                  toast.success("تم رفض الطلب");
                  markRead.mutate(notification.id);
                },
                onError: () => toast.error("تعذر رفض الطلب"),
              })
            }
          >
            <X className="size-4" />
            رفض
          </Button>
        </div>
      )}
    </div>
  );
}

export function NotificationsList({
  notifications,
  scrollClassName,
}: {
  notifications: NotificationItem[];
  scrollClassName?: string;
}) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
        <Bell className="size-8" />
        <p className="text-sm">لا توجد إشعارات</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2 overflow-auto p-1", scrollClassName)}>
      {notifications.map((notification) => (
        <NotificationRow key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

export function NotificationsListSkeleton({
  scrollClassName,
}: {
  scrollClassName?: string;
}) {
  return (
    <div className={cn("space-y-2 p-1", scrollClassName)}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function NotificationListContent({
  scrollClassName,
}: {
  scrollClassName?: string;
}) {
  const { data: notifications, isLoading, isError } = useNotifications();

  if (isLoading) {
    return <NotificationsListSkeleton scrollClassName={scrollClassName} />;
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        تعذر تحميل الإشعارات
      </p>
    );
  }

  return (
    <NotificationsList
      notifications={notifications ?? []}
      scrollClassName={scrollClassName}
    />
  );
}
