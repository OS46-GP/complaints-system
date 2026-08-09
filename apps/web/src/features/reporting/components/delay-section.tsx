import { useState } from "react";
import { AlarmClock, ChevronDown } from "lucide-react";

import { ReportResultTable } from "@/features/reporting/components/report-result-table";
import type { DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DelayReport } from "@/features/reporting/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const SEVERITY_META: Record<string, { label: string; chip: string }> = {
  High: {
    label: "عالية",
    chip: "bg-red-500/10 text-red-600",
  },
  Medium: {
    label: "متوسطة",
    chip: "bg-amber-500/10 text-amber-600",
  },
  Low: {
    label: "منخفضة",
    chip: "bg-green-500/10 text-green-600",
  },
};

const columns: DataTableColumn[] = [
  { key: "department", label: "الجهة" },
  { key: "overdueCount", label: "عدد المتأخر", className: "text-center" },
  { key: "avgDays", label: "متوسط أيام التأخير", className: "text-center" },
];

interface DelaySectionProps {
  report: DelayReport;
}

function complaintOverdueDays(
  arrivalDate: string,
  severity: string | null,
  thresholds: DelayReport["thresholds"],
): number {
  const thresholdDays =
    severity === "High" || severity === "Medium" || severity === "Low"
      ? thresholds[severity]
      : thresholds.Medium;
  const elapsed = Date.now() - new Date(arrivalDate).getTime();
  return Math.max(0, Math.floor(elapsed / MS_PER_DAY) - thresholdDays);
}

export function DelaySection({ report }: DelaySectionProps) {
  const [showComplaints, setShowComplaints] = useState(false);
  const { departments } = report;

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading text-title-sm md:text-title-md text-foreground">
          تقرير المتأخرات حسب الجهة
        </h2>
      </div>

      <ReportResultTable columns={columns} emptyText="لا توجد شكاوى متأخرة">
        {departments.map((row) => (
          <tr key={row.department} className="border-b border-border last:border-b-0">
            <td className="px-6 py-3.5 font-heading text-label-sm text-foreground">
              {row.department}
            </td>
            <td className="px-6 py-3.5 text-center">
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 font-mono text-mono-data",
                  row.overdueCount > 0
                    ? "bg-destructive/10 text-destructive"
                    : "bg-green-500/10 text-green-600",
                )}
              >
                {row.overdueCount.toLocaleString("ar-SA")}
              </span>
            </td>
            <td className="px-6 py-3.5 text-center font-mono text-mono-data">
              {row.avgDaysOverdue.toLocaleString("ar-SA")}
            </td>
          </tr>
        ))}
      </ReportResultTable>

      <div className="flex flex-wrap items-center gap-4 text-label-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <AlarmClock className="size-4 text-destructive" />
          إجمالي المتأخر: {report.totalOverdue.toLocaleString("ar-SA")}
        </span>
        <span className="inline-flex flex-wrap items-center gap-2">
          عتبات التأخير (يوم):
          {[
            { label: "عالية", days: report.thresholds?.High, className: "bg-red-500/10 text-red-600" },
            { label: "متوسطة", days: report.thresholds?.Medium, className: "bg-amber-500/10 text-amber-600" },
            { label: "منخفضة", days: report.thresholds?.Low, className: "bg-green-500/10 text-green-600" },
          ].map(
            ({ label, days, className }) =>
              days !== undefined && (
                <span
                  key={label}
                  className={cn(
                    "inline-flex h-6 items-center gap-1 rounded-full px-2.5 font-mono text-mono-data",
                    className,
                  )}
                >
                  {label}: {days.toLocaleString("ar-SA")}
                </span>
              ),
          )}
        </span>
      </div>

      {report.complaints.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-container-lowest">
          <Button
            type="button"
            variant="ghost"
            size="default"
            className="h-auto w-full justify-between gap-2 px-6 py-4"
            onClick={() => setShowComplaints((v) => !v)}
          >
            <span className="font-heading text-label-sm text-foreground">
              الشكاوى المتأخرة ({report.complaints.length.toLocaleString("ar-SA")})
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                showComplaints && "rotate-180",
              )}
            />
          </Button>

          {showComplaints && (
            <ul className="divide-y divide-border border-t border-border">
              {report.complaints.map((c) => {
                const severityMeta = c.severity
                  ? SEVERITY_META[c.severity]
                  : undefined;
                const daysOverdue = complaintOverdueDays(
                  c.arrivalDate,
                  c.severity,
                  report.thresholds,
                );
                return (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-3"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-heading text-label-sm text-foreground truncate">
                        {c.subject || "بدون موضوع"}
                      </span>
                      <span className="flex flex-wrap items-center gap-2 text-label-sm text-muted-foreground">
                        {c.citizenName} · {c.department ?? "غير محدد"}
                        {severityMeta && (
                          <span
                            className={cn(
                              "inline-flex h-5 items-center rounded-full px-2 font-mono text-mono-data",
                              severityMeta.chip,
                            )}
                          >
                            {severityMeta.label}
                          </span>
                        )}
                        {daysOverdue > 0 && (
                          <span className="inline-flex h-5 items-center rounded-full bg-destructive/10 px-2 font-mono text-mono-data text-destructive">
                            +{daysOverdue.toLocaleString("ar-SA")} يوم تأخير
                          </span>
                        )}
                      </span>
                    </div>
                    <span
                      dir="ltr"
                      className="font-mono text-mono-data text-muted-foreground"
                    >
                      #{c.complaintNumber}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
