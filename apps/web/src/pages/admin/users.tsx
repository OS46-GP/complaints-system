import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router";
import { Plus, Loader2 } from "lucide-react";

import { PATHS } from "@/router/paths";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { UserList } from "@/features/user-list/user-list";
import { usersApi } from "@/features/users/api";
import { mapApiUser } from "@/features/user-list/types";

export default function AdminUsers() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";

  const { data: apiUsers, isLoading } = useQuery({
    queryKey: ["users", search, role],
    queryFn: () =>
      usersApi.list({
        search: search || undefined,
        role: role || undefined,
      }),
  });

  const users = apiUsers?.map(mapApiUser) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="إدارة طاقم العمل"
        description="تنظيم الصلاحيات ومتابعة أداء الموظفين في معالجة الشكاوى"
      >
        <Button asChild className="gap-2">
          <Link to={PATHS.ADMIN.NEW_USER}>
            <Plus className="size-5" />
            <span>دعوة موظف جديد</span>
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <UserList users={users} />
      )}
    </div>
  );
}
