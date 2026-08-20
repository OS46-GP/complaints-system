import { Fragment, useState } from "react";
import { AlarmClock, ChevronDown, Loader2 } from "lucide-react";

import { ReportResultTable } from "@/features/reporting/components/report-result-table";
import { ComplaintDetailsButton } from "@/features/reporting/components/complaint-details-button";
import { ReportListPagination } from "@/features/reporting/components/report-list-pagination";
import type { DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDelayDepartmentComplaints } from "@/features/reporting/hooks";
import type {
  DelayReport,
  OverdueComplaint,
  ReportFilters,
} from "@/features/reporting/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const INLINE_PAGE_SIZE = 20;

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
  filters?: ReportFilters;
}

function DelayDepartmentDetail({
  department,
  filters,
  isOpen,
  inlineComplaints,
  thresholds,
}: {
  department: string;
  filters?: ReportFilters;
  isOpen: boolean;
  inlineComplaints?: OverdueComplaint[];
  thresholds: DelayReport["thresholds"];
}) {
  const useInline = inlineComplaints != null;
  const [inlinePage, setInlinePage] = useState(1);
  const [serverPage, setServerPage] = useState(1);
  const { data, isFetching } = useDelayDepartmentComplaints(
    useInline ? null : department,
    filters,
    isOpen && !useInline,
    serverPage,
  );

  if (!isOpen) return null;

  let complaints: OverdueComplaint[];
  let total: number;
  let totalPages: number;
  let page: number;

  if (useInline) {
    total = inlineComplaints.length;
    totalPages = Math.max(1, Math.ceil(total / INLINE_PAGE_SIZE));
    page = Math.min(inlinePage, totalPages);
    complaints = inlineComplaints.slice(
      (page - 1) * INLINE_PAGE_SIZE,
      page * INLINE_PAGE_SIZE,
    );
  } else {
    complaints = data?.complaints ?? [];
    total = data?.total ?? 0;
    totalPages = data?.totalPages ?? 1;
    page = data?.page ?? serverPage;
  }

  const handlePageChange = (next: number) => {
    if (useInline) setInlinePage(next);
    else setServerPage(next);
  };

  return (
    <tr className="border-b border-border bg-surface-container-lowest/60 last:border-b-0">
      <td colSpan={columns.length} className="px-6 py-4">
        <div className="grid gap-3">
          {isFetching ? (
            <p className="flex items-center justify-center gap-2 py-4 text-label-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              جارٍ تحميل الشكاوى المتأخرة...
            </p>
          ) : complaints.length === 0 ? (
            <p className="py-2 text-center text-label-sm text-muted-foreground">
              لا توجد شكاوى متأخرة لهذه الجهة
            </p>
          ) : (
            <>
              <div className="grid gap-2">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="rounded-lg border border-border bg-card px-4 py-2.5"
                  >
                    <DelayComplaintItem
                      complaint={complaint}
                      thresholds={thresholds}
                    />
                  </div>
                ))}
              </div>
              <ReportListPagination
                page={page}
                totalPages={totalPages}
                total={total}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );
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

function DelayComplaintItem({
  complaint,
  thresholds,
}: {
  complaint: OverdueComplaint;
  thresholds: DelayReport["thresholds"];
}) {
  const severityMeta = complaint.severity
    ? SEVERITY_META[complaint.severity]
    : undefined;
  const daysOverdue = complaintOverdueDays(
    complaint.arrivalDate,
    complaint.severity,
    thresholds,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate font-heading text-label-sm text-foreground">
          {complaint.subject || "بدون موضوع"}
        </span>
        <span className="flex flex-wrap items-center gap-2 text-label-sm text-muted-foreground">
          {complaint.citizenName} · {complaint.department ?? "غير محدد"}
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
        #{complaint.complaintNumber}
      </span>
      <ComplaintDetailsButton complaintId={complaint.id} label="عرض" />
    </div>
  );
}

export function DelaySection({ report, filters }: DelaySectionProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { departments } = report;

  const toggle = (department: string) => {
    setExpanded((prev) => (prev === department ? null : department));
  };

  const complaintsFor = (department: string) =>
    report.complaints?.filter(
      (c) => (c.department ?? "غير محدد") === department,
    ) ?? undefined;

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading text-title-sm md:text-title-md text-foreground">
          تقرير المتأخرات حسب الجهة
        </h2>
      </div>

      <ReportResultTable columns={columns} emptyText="لا توجد شكاوى متأخرة">
        {departments.map((row) => {
          const isOpen = expanded === row.department;
          return (
            <Fragment key={row.department}>
              <tr className="border-b border-border last:border-b-0">
                <td className="px-6 py-3.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 p-0 font-heading text-label-sm text-foreground"
                    aria-expanded={isOpen}
                    onClick={() => toggle(row.department)}
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                    {row.department}
                  </Button>
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
              <DelayDepartmentDetail
                department={row.department}
                filters={filters}
                isOpen={isOpen}
                inlineComplaints={complaintsFor(row.department)}
                thresholds={report.thresholds}
              />
            </Fragment>
          );
        })}
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
    </section>
  );
}