import { Target, FolderOpen, AlarmClock } from "lucide-react";

interface ReportingSummaryCardsProps {
  achievement: number;
  totalOpen: number;
  totalOverdue: number;
}

export function ReportingSummaryCards({
  achievement,
  totalOpen,
  totalOverdue,
}: ReportingSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6">
        <Target className="size-7 text-primary" />
        <p className="font-heading text-label-sm text-muted-foreground">
          نسبة الإنجاز الكلية
        </p>
        <h3 className="font-heading text-display-lg text-foreground">
          {achievement.toLocaleString("ar-SA")}%
        </h3>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6">
        <FolderOpen className="size-7 text-amber-500" />
        <p className="font-heading text-label-sm text-muted-foreground">
          الشكاوى قيد الفحص
        </p>
        <h3 className="font-heading text-display-lg text-foreground">
          {totalOpen.toLocaleString("ar-SA")}
        </h3>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6">
        <AlarmClock className="size-7 text-destructive" />
        <p className="font-heading text-label-sm text-muted-foreground">
          الشكاوى المتأخرة
        </p>
        <h3 className="font-heading text-display-lg text-foreground">
          {totalOverdue.toLocaleString("ar-SA")}
        </h3>
      </div>
    </div>
  );
}
