import { PageHeader } from "@/components/shared/page-header";
import { NotificationListContent } from "@/features/notifications/notification-list-content";

export function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader
        title="الإشعارات"
        description="طلبات إعادة تعيين كلمة المرور والإشعارات الواردة"
      />
      <NotificationListContent />
    </div>
  );
}
