import { useSearchParams } from "react-router";

import { PATHS } from "@/router/paths";
import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { NewComplaintButton } from "@/features/complaint-list/new-complaint-button";
import { ComplaintList } from "@/features/complaint-list/complaint-list";
import { ComplaintListSkeleton } from "@/features/complaint-list/complaint-list-skeleton";
import { useComplaintsFromSearchParams } from "@/features/complaint-list/hooks";
import { usePreferences } from "@/features/settings/preferences/store";

export default function AdminComplaints() {
  const [searchParams] = useSearchParams();
  const { preferences } = usePreferences();
  const pageSize = preferences.complaints.pageSize;
  const { data, isLoading, isError, refetch } = useComplaintsFromSearchParams(
    searchParams,
    pageSize,
  );

  const complaints = data?.complaints ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="إدارة الشكاوى"
        description="متابعة ومعالجة جميع الشكاوى الواردة"
      >
        <NewComplaintButton
          newComplaintPath={PATHS.ADMIN.NEW_COMPLAINT}
          ocrPath={PATHS.ADMIN.COMPLAINT_OCR}
        />
      </PageHeader>

      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل الشكاوى"
        skeleton={<ComplaintListSkeleton />}
      >
        <ComplaintList
          complaints={complaints}
          totalPages={meta?.totalPages ?? 1}
          totalCount={meta?.total ?? 0}
          pageSize={pageSize}
        />
      </AsyncLoader>
    </div>
  );
}
