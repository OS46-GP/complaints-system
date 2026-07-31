import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link2, RefreshCw } from "lucide-react";
import { getComplaintLinks, analyzeComplaint } from "@/features/complaint-detail/api";
import { RecurrenceMatchList } from "@/components/shared/recurrence-match-list";
import { Button } from "@/components/ui/button";

interface ComplaintLinksPanelProps {
  complaintId: string;
}

export function ComplaintLinksPanel({ complaintId }: ComplaintLinksPanelProps) {
  const queryClient = useQueryClient();

  const { data: links, isLoading } = useQuery({
    queryKey: ["complaint-links", complaintId],
    queryFn: () => getComplaintLinks(complaintId),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeComplaint(complaintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint-links", complaintId] });
    },
    onError: () => {
      toast.error("تعذر إجراء التحليل");
    },
  });

  const matches = links ?? [];

  return (
    <section className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="size-5 text-primary" />
        <h3 className="font-heading text-title-sm text-foreground">شكاوى مشابهة / مرتبطة</h3>
      </div>

      {isLoading ? (
        <p className="font-body text-body-md text-muted-foreground">جارٍ التحميل...</p>
      ) : matches.length > 0 ? (
        <RecurrenceMatchList matches={matches} emptyText="" />
      ) : (
        <div className="space-y-3">
          <p className="font-body text-body-md text-muted-foreground">
            لا توجد شكاوى مرتبطة حالياً.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${analyzeMutation.isPending ? "animate-spin" : ""}`} />
            {analyzeMutation.isPending ? "جارٍ التحليل..." : "تحليل الآن"}
          </Button>
        </div>
      )}
    </section>
  );
}
