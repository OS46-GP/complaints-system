import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router";
import { Plus, Loader2 } from "lucide-react";

import { PATHS } from "@/router/paths";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ComplaintList } from "@/features/complaint-list/complaint-list";
import { complaintsApi } from "@/features/complaint-list/api";
import { mapApiComplaint } from "@/features/complaint-list/types";

const PAGE_SIZE = 10;

export default function AdminComplaints() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  const { data: response, isLoading } = useQuery({
    queryKey: ["complaints", search, page],
    queryFn: () =>
      complaintsApi.list({
        name: search || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const complaints = response?.data.map(mapApiComplaint) ?? [];
  const meta = response?.meta;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="إدارة الشكاوى"
        description="متابعة ومعالجة جميع الشكاوى الواردة"
      >
        <Button asChild className="gap-2">
          <Link to={PATHS.ADMIN.NEW_COMPLAINT}>
            <Plus className="size-5" />
            <span>شكوى جديدة</span>
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ComplaintList
          complaints={complaints}
          totalPages={meta?.totalPages ?? 1}
          totalCount={meta?.total ?? 0}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  );
}
