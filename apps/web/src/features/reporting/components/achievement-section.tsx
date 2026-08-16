import { Fragment, useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, Target } from "lucide-react";

import { ReportResultTable } from "@/features/reporting/components/report-result-table";
import type { DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAchievementDepartmentComplaints } from "@/features/reporting/hooks";
import type {
  AchievementComplaint,
  AchievementReport,
  ReportFilters,
} from "@/features/reporting/types";

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
  { key: "total", label: "الإجمالي", className: "text-center" },
  { key: "finished", label: "المنتهية", className: "text-center" },
  { key: "percentage", label: "نسبة الإنجاز", className: "w-1/3" },
];

interface AchievementSectionProps {
  report: AchievementReport;
  filters?: ReportFilters;
}

function AchievementDepartmentDetail({
  department,
  filters,
  isOpen,
  inlineComplaints,
}: {
  department: string;
  filters?: ReportFilters;
  isOpen: boolean;
  inlineComplaints?: AchievementComplaint[];
}) {
  const useInline = inlineComplaints != null;
  const { data, isFetching } = useAchievementDepartmentComplaints(
    useInline ? null : department,
    filters,
    isOpen && !useInline,
  );

  if (!isOpen) return null;

  const complaints = inlineComplaints ?? data?.complaints ?? [];

  return (
    <tr className="border-b border-border bg-surface-container-lowest/60 last:border-b-0">
      <td colSpan={columns.length} className="px-6 py-4">
        <div className="grid gap-2">
          {isFetching ? (
            <p className="flex items-center justify-center gap-2 py-4 text-label-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              جارٍ تحميل التفاصيل...
            </p>
          ) : complaints.length === 0 ? (
            <p className="py-2 text-center text-label-sm text-muted-foreground">
              لا توجد تفاصيل للجهة في هذه الفترة
            </p>
          ) : (
            complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2.5"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-heading text-label-sm text-foreground">
                    {complaint.subject || "بدون موضوع"}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-label-sm text-muted-foreground">
                    {complaint.citizenName}
                    {complaint.severity && (
                      <span
                        className={cn(
                          "inline-flex h-5 items-center rounded-full px-2 font-mono text-mono-data",
                          SEVERITY_META[complaint.severity]?.chip,
                        )}
                      >
                        {SEVERITY_META[complaint.severity]?.label ?? complaint.severity}
                      </span>
                    )}
                    <span dir="ltr" className="font-mono text-mono-data">
                      #{complaint.complaintNumber}
                    </span>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-label-sm text-muted-foreground">
                    {new Date(complaint.arrivalDate).toLocaleDateString("ar-EG")}
                  </span>
                  <span
                    className={cn(
                      "inline-flex h-5 items-center rounded-full px-2 font-mono text-mono-data",
                      complaint.finished
                        ? "bg-green-500/10 text-green-600"
                        : "bg-amber-500/10 text-amber-600",
                    )}
                  >
                    {complaint.finished ? "منتهية" : "غير منتهية"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </td>
    </tr>
  );
}

export function AchievementSection({ report, filters }: AchievementSectionProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { departments } = report;

  const toggle = (department: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(department)) {
        next.delete(department);
      } else {
        next.add(department);
      }
      return next;
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-title-sm md:text-title-md text-foreground">
          نسبة الإنجاز حسب الجهة
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-label-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Target className="size-4 text-primary" />
            الإجمالي: {report.governorateTotal.toLocaleString("ar-SA")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-green-600" />
            المنتهية: {report.governorateFinished.toLocaleString("ar-SA")}
          </span>
        </div>
      </div>

      <ReportResultTable columns={columns} emptyText="لا توجد شكاوى في هذه الفترة">
        {departments.map((row) => {
          const isOpen = expanded.has(row.department);
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
                <td className="px-6 py-3.5 text-center font-mono text-mono-data">
                  {row.total.toLocaleString("ar-SA")}
                </td>
                <td className="px-6 py-3.5 text-center font-mono text-mono-data">
                  {row.finished.toLocaleString("ar-SA")}
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${row.percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-end font-mono text-mono-data text-foreground">
                      {row.percentage.toLocaleString("ar-SA")}%
                    </span>
                  </div>
                </td>
              </tr>
              <AchievementDepartmentDetail
                department={row.department}
                filters={filters}
                isOpen={isOpen}
                inlineComplaints={row.complaints}
              />
            </Fragment>
          );
        })}
      </ReportResultTable>
    </section>
  );
}