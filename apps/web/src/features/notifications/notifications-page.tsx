import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import {
  NotificationsList,
  NotificationsListSkeleton,
} from "@/features/notifications/notification-list-content";
import { useNotifications } from "@/features/notifications/hooks";

export function NotificationsPage() {
  const {
    data: notifications,
    isLoading,
    isError,
    refetch,
  } = useNotifications();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="الإشعارات"
        description="طلبات إعادة تعيين كلمة المرور والإشعارات الواردة"
      />
      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل الإشعارات"
        skeleton={<NotificationsListSkeleton />}
      >
        <NotificationsList notifications={notifications ?? []} />
      </AsyncLoader>
    </div>
  );
}
