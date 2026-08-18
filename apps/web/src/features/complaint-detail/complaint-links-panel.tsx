import { useMemo } from "react";
import { toast } from "sonner";
import { Link2, RefreshCw, Sparkles } from "lucide-react";
import { useComplaintLinks, useUnlinkComplaint } from "@/features/complaint-detail/hooks";
import type { AnalyzeResponse } from "@/features/complaint-detail/api";
import { RecurrenceMatchList } from "@/components/shared/recurrence-match-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface ComplaintLinksPanelProps {
  complaintId: string;
  analyzeResult?: AnalyzeResponse | null;
  isAnalyzing?: boolean;
  onAnalyze?: () => void;
}

export function ComplaintLinksPanel({
  complaintId,
  analyzeResult,
  isAnalyzing,
  onAnalyze,
}: ComplaintLinksPanelProps) {
  const { data: links, isLoading, isError, refetch, isFetching } = useComplaintLinks(complaintId);
  const unlinkMutation = useUnlinkComplaint(complaintId);

  const persisted = links ?? [];

  const aiMatches = useMemo(() => analyzeResult?.recurrenceMatches ?? [], [analyzeResult]);
  const hasAnalyzed = analyzeResult != null && onAnalyze != null;

  const shownMatches = hasAnalyzed ? aiMatches : persisted;

  const severityBadge = analyzeResult
    ? severityLabels[analyzeSeverityLabel(analyzeResult.severity)]
    : null;

  return (
    <section className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-heading text-title-sm text-foreground flex items-center gap-2">
          <Link2 className="size-5 text-primary" />
          شكاوى مشابهة / مرتبطة
        </h3>
      </div>

      {hasAnalyzed && severityBadge && (
        <div className="mb-3 flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Sparkles className="size-4 text-primary shrink-0" />
          <p className="font-body text-body-sm text-foreground">
            تحليل الذكاء الاصطناعي: درجة الخطورة{" "}
            <span className="font-semibold">{severityBadge.label}</span> — يمكنك تعديلها من بطاقة معلومات الشكوى.
          </p>
        </div>
      )}

      {persisted.length > 0 && hasAnalyzed && (
        <p className="mb-3 font-body text-body-sm text-muted-foreground">
          نتائج التحليل الجديد ({aiMatches.length}) أعلاه؛ الروابط المحفوظة سابقاً ({persisted.length}).
        </p>
      )}

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
      ) : shownMatches.length > 0 ? (
        <RecurrenceMatchList
          matches={shownMatches}
          emptyText=""
          onUnlink={
            !hasAnalyzed
              ? (matchId) =>
                  unlinkMutation.mutate(matchId, {
                    onError: () => toast.error("تعذر إلغاء الربط"),
                  })
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="font-body text-body-md text-muted-foreground">
            {hasAnalyzed
              ? "لم يجد الذكاء الاصطناعي شكاوى مشابهة لهذه الشكوى."
              : "لا توجد شكاوى مرتبطة حالياً. قم بتشغيل التحليل الذكي لاكتشاف الشكاوى المشابهة."}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
              تحديث
            </Button>
            {onAnalyze && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAnalyze()}
                disabled={isAnalyzing}
                className="gap-2"
              >
                <RefreshCw className={`size-4 ${isAnalyzing ? "animate-spin" : ""}`} />
                {isAnalyzing ? "جارٍ التحليل..." : "تحليل الآن"}
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function analyzeSeverityLabel(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

const severityLabels: Record<string, { label: string; color: string }> = {
  High: { label: "عالية", color: "" },
  Medium: { label: "متوسطة", color: "" },
  Low: { label: "منخفضة", color: "" },
};