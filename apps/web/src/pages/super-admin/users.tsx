import { useSearchParams, Link } from "react-router";
import { Plus } from "lucide-react";

import { PATHS } from "@/router/paths";
import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { Button } from "@/components/ui/button";
import { UserList } from "@/features/users/user-list";
import { UserListSkeleton } from "@/features/users/user-list-skeleton";
import { useUsers } from "@/features/users/hooks";

export default function SuperAdminUsers() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";

  const { data: users, isLoading, isError, refetch } = useUsers({
    search: search || undefined,
    role: role || undefined,
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="إدارة المستخدمين"
        description="إدارة الحسابات: إنشاء وتعديل مستخدمين ومسؤولين ومديري النظام"
      >
        <Button asChild className="gap-2">
          <Link to={PATHS.SUPER_ADMIN.NEW_USER}>
            <Plus className="size-5" />
            <span>إضافة مستخدم جديد</span>
          </Link>
        </Button>
      </PageHeader>

      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل المستخدمين"
        skeleton={<UserListSkeleton />}
      >
        <UserList users={users ?? []} />
      </AsyncLoader>
    </div>
  );
}
