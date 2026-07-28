import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { getComplaintDetails } from "@/features/complaint-detail/api";
import { ComplaintDetailsView } from "@/features/complaint-detail/complaint-details-view";

export default function AdminComplaintDetail() {
  const { id } = useParams();

  const { data: complaint, isLoading } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => getComplaintDetails(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">لم يتم العثور على الشكوى</p>
      </div>
    );
  }

  return (
    <section className="p-0 md:p-stack-lg flex flex-col flex-grow">
      <ComplaintDetailsView complaint={complaint} />
    </section>
  );
}
