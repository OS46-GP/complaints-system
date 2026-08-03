import { CheckCircle2, Target } from "lucide-react";

import { ReportResultTable } from "@/features/reporting/components/report-result-table";
import type { DataTableColumn } from "@/components/shared/data-table";
import type { AchievementReport } from "@/features/reporting/types";

const columns: DataTableColumn[] = [
  { key: "department", label: "الجهة" },
  { key: "total", label: "الإجمالي", className: "text-center" },
  { key: "finished", label: "المنتهية", className: "text-center" },
  { key: "percentage", label: "نسبة الإنجاز", className: "w-1/3" },
];

interface AchievementSectionProps {
  report: AchievementReport;
}

export function AchievementSection({ report }: AchievementSectionProps) {
  const { departments } = report;

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
        {departments.map((row) => (
          <tr key={row.department} className="border-b border-border last:border-b-0">
            <td className="px-6 py-3.5 font-heading text-label-sm text-foreground">
              {row.department}
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
        ))}
      </ReportResultTable>
    </section>
  );
}
