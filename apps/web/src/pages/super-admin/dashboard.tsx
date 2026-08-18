import { Link } from "react-router";
import { Users, ShieldCheck, FilePlus2 } from "lucide-react";

import { PATHS } from "@/router/paths";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { RecentNotifications } from "@/features/notifications/recent-notifications";

export default function SuperAdminDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="إدارة النظام"
        description="لوحة تحكم مدير النظام الأعلى"
      >
        <Button asChild className="gap-2">
          <Link to={PATHS.SUPER_ADMIN.USERS}>
            <Users className="size-5" />
            إدارة المستخدمين
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-surface-container-lowest p-5">
          <ShieldCheck className="size-8 text-primary mb-3" />
          <h3 className="font-heading text-lg font-bold">إدارة الصلاحيات</h3>
          <p className="text-sm text-muted-foreground mt-1">
            إنشاء وتعديل حسابات المسؤولين ومديري النظام والمستخدمين العاديين.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-container-lowest p-5">
          <Users className="size-8 text-primary mb-3" />
          <h3 className="font-heading text-lg font-bold">المستخدمون</h3>
          <p className="text-sm text-muted-foreground mt-1">
            عرض جميع الحسابات وإعادة تعيين كلمات المرور عند طلبها.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-container-lowest p-5">
          <FilePlus2 className="size-8 text-primary mb-3" />
          <h3 className="font-heading text-lg font-bold">إضافة مستخدم</h3>
          <p className="text-sm text-muted-foreground mt-1">
            إنشاء حساب جديد مباشرة من لوحة التحكم.
          </p>
        </div>
      </div>

      <RecentNotifications limit={5} />
    </div>
  );
}
