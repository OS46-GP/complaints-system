import { toast } from "sonner";
import { Link2, RefreshCw } from "lucide-react";
import { useComplaintLinks, useAnalyzeComplaint, useUnlinkComplaint } from "@/features/complaint-detail/hooks";
import { RecurrenceMatchList } from "@/components/shared/recurrence-match-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface ComplaintLinksPanelProps {
  complaintId: string;
}

export function ComplaintLinksPanel({ complaintId }: ComplaintLinksPanelProps) {
  const { data: links, isLoading, isError, refetch } = useComplaintLinks(complaintId);
  const analyzeMutation = useAnalyzeComplaint(complaintId);
  const unlinkMutation = useUnlinkComplaint(complaintId);

  const matches = links ?? [];

  return (
    <section className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="size-5 text-primary" />
        <h3 className="font-heading text-title-sm text-foreground">شكاوى مشابهة / مرتبطة</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : isError ? (
        <div className="space-y-3">
          <p className="font-body text-body-md text-muted-foreground">
            تعذر تحميل الشكاوى المرتبطة.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            إعادة المحاولة
          </Button>
        </div>
      ) : matches.length > 0 ? (
        <RecurrenceMatchList
          matches={matches}
          emptyText=""
          onUnlink={(matchId) =>
            unlinkMutation.mutate(matchId, {
              onError: () => toast.error("تعذر إلغاء الربط"),
            })
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="font-body text-body-md text-muted-foreground">
            لا توجد شكاوى مرتبطة حالياً.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              analyzeMutation.mutate(undefined, {
                onError: () => toast.error("تعذر إجراء التحليل"),
              })
            }
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
