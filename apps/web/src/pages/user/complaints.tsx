import { useSearchParams } from "react-router";

import { PATHS } from "@/router/paths";
import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { NewComplaintButton } from "@/features/complaint-list/new-complaint-button";
import { ComplaintList } from "@/features/complaint-list/complaint-list";
import { useComplaintsFromSearchParams } from "@/features/complaint-list/hooks";

const PAGE_SIZE = 10;

export default function UserComplaints() {
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError, refetch } =
    useComplaintsFromSearchParams(searchParams, PAGE_SIZE);

  const complaints = data?.complaints ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="الشكاوى"
        description="قائمة بجميع الشكاوى المقدمة"
      >
        <NewComplaintButton newComplaintPath={PATHS.USER.NEW_COMPLAINT} ocrPath={PATHS.USER.COMPLAINT_OCR} />
      </PageHeader>

      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل الشكاوى"
      >
        <ComplaintList
          complaints={complaints}
          totalPages={meta?.totalPages ?? 1}
          totalCount={meta?.total ?? 0}
          pageSize={PAGE_SIZE}
        />
      </AsyncLoader>
    </div>
  );
}
