import { useParams } from "react-router";

import { AsyncLoader } from "@/components/shared/async-loader";
import { useComplaint } from "@/features/complaint-detail/hooks";
import { ComplaintDetailsView } from "@/features/complaint-detail/complaint-details-view";
import { ComplaintDetailsSkeleton } from "@/features/complaint-detail/complaint-details-skeleton";

export default function UserComplaintDetail() {
  const { id } = useParams();
  const { data: complaint, isLoading, isError, refetch } = useComplaint(id);

  return (
    <section className="p-0 md:p-stack-lg flex flex-col flex-grow">
      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل بيانات الشكوى"
        skeleton={<ComplaintDetailsSkeleton />}
      >
        {complaint ? (
          <ComplaintDetailsView complaint={complaint} />
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">لم يتم العثور على الشكوى</p>
          </div>
        )}
      </AsyncLoader>
    </section>
  );
}
