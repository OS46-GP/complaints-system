import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUnreadCount } from "@/features/notifications/hooks";
import { NotificationListContent } from "@/features/notifications/notification-list-content";
import { useState } from "react";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data } = useUnreadCount();
  const unread = data?.count ?? 0;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-label="الإشعارات"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>الإشعارات</DialogTitle>
          </DialogHeader>
          <NotificationListContent />
        </DialogContent>
      </Dialog>
    </>
  );
}
