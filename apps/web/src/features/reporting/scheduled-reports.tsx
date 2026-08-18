import { useState } from "react";
import { CalendarClock, ChevronLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { ListPagination } from "@/components/shared/list-pagination";
import { PaginationInfo } from "@/components/shared/pagination-info";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportsNav } from "@/features/reporting/components/reports-nav";
import { GeneratedReportView } from "@/features/reporting/components/generated-report-view";
import { ScheduledListSkeleton } from "@/features/reporting/components/report-skeletons";
import { useScheduledReports } from "@/features/reporting/hooks";
import { cn } from "@/lib/utils";
import {
  getReportTypeLabel,
  type GeneratedReport,
  type ReportType,
} from "@/features/reporting/types";

const PAGE_SIZE = 10;

interface ScheduledReportsProps {
  basePath: string;
}

export function ScheduledReports({ basePath }: ScheduledReportsProps) {
  const [type, setType] = useState<ReportType | "">("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<GeneratedReport | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useScheduledReports({
    type: type || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const reports = data?.reports ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  const handleTypeChange = (value: string) => {
    setType(value as ReportType | "");
    setPage(1);
    setSelected(null);
  };

  const handleSelect = (report: GeneratedReport) => {
    setSelected((prev) => (prev?.id === report.id ? null : report));
  };

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, data?.total ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <ReportsNav basePath={basePath} />

      <PageHeader
        title="التقارير المجدولة"
        description="التقارير المُولّدة تلقائيًا يوميًا وأسبوعيًا — اضغط على أي تقرير لعرضه وتصديره"
      />

      <div className="flex justify-start">
        <Select value={type || undefined} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="كل أنواع التقارير" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل أنواع التقارير</SelectItem>
            <SelectItem value="ACHIEVEMENT">نسبة الإنجاز</SelectItem>
            <SelectItem value="DELAY">المتأخرات</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل التقارير المجدولة"
        skeleton={<ScheduledListSkeleton />}
      >
        {reports.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <CalendarClock className="size-10 text-muted-foreground/40" />
            <p className="font-heading text-body-lg font-semibold text-foreground">
              لا توجد تقارير مجدولة بعد
            </p>
            <p className="text-body-sm text-muted-foreground">
              تُنشأ التقارير يوميًا وأسبوعيًا تلقائيًا، أو يمكنك توليد تقرير يدويًا
              من شاشة «التوليد عند الطلب»
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-container-lowest">
              {reports.map((report) => {
                const isSelected = selected?.id === report.id;
                return (
                  <li
                    key={report.id}
                    className={cn("flex flex-col", isSelected && "bg-surface-container-low")}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(report)}
                      className="flex min-w-0 flex-1 items-center gap-3 px-6 py-4 text-start"
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          isSelected
                            ? "bg-primary/15 text-primary"
                            : "bg-surface-container-high text-muted-foreground",
                        )}
                      >
                        <CalendarClock className="size-4" />
                      </span>
                      <span className="min-w-0 flex-col gap-0.5 flex">
                        <span className="font-heading text-label-sm font-semibold text-foreground truncate">
                          {getReportTypeLabel(report.type)}
                        </span>
                        <span className="text-label-sm text-muted-foreground truncate">
                          {report.periodLabel}
                        </span>
                      </span>
                      <span className="hidden sm:block ms-auto text-label-xs text-muted-foreground shrink-0">
                        {new Date(report.generatedAt).toLocaleString("ar-SA")}
                      </span>
                      <ChevronLeft
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform rtl:rotate-180",
                          isSelected && "rotate-180 text-primary",
                        )}
                      />
                    </button>

                    {isSelected && (
                      <div className="border-t border-border px-6 py-6">
                        <GeneratedReportView report={report} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 rounded-xl border border-border bg-surface-container-lowest px-6 py-4">
                <ListPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  showGoto={false}
                />
                <PaginationInfo
                  start={start}
                  end={end}
                  totalCount={data?.total ?? 0}
                  entity="تقرير"
                />
              </div>
            )}
          </div>
        )}
      </AsyncLoader>
    </div>
  );
}
