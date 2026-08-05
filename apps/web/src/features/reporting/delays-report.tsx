import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { Button } from "@/components/ui/button";
import { ReportingFilterBar } from "@/features/reporting/components/reporting-filter-bar";
import { DelaySection } from "@/features/reporting/components/delay-section";
import { ReportsNav } from "@/features/reporting/components/reports-nav";
import { ReportTableSkeleton } from "@/features/reporting/components/report-skeletons";
import {
  lastYearRange,
  type DateRangeValue,
} from "@/features/reporting/components/date-range-picker";
import { useDelayReport } from "@/features/reporting/hooks";
import type { ReportFilters } from "@/features/reporting/types";

interface DelaysReportPageProps {
  basePath: string;
}

export function DelaysReportPage({ basePath }: DelaysReportPageProps) {
  const [draftRange, setDraftRange] = useState<DateRangeValue>(lastYearRange());
  const [draftDepartment, setDraftDepartment] = useState("");
  const [applied, setApplied] = useState<ReportFilters>(lastYearRange());

  const { data, isLoading, isError, refetch } = useDelayReport(applied);

  const handleApply = () => {
    setApplied({
      from: draftRange.from || undefined,
      to: draftRange.to || undefined,
      department: draftDepartment || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <ReportsNav basePath={basePath} />

      <PageHeader
        title="تقرير المتأخرات حسب الجهة"
        description="جميع الجهات وعدد الشكاوى المتأخرة عنها ومتوسط أيام التأخير"
      />

      <ReportingFilterBar
        dateRange={draftRange}
        onDateRangeChange={setDraftRange}
        department={draftDepartment}
        onDepartmentChange={setDraftDepartment}
      />

      <div className="flex justify-end">
        <Button type="button" onClick={handleApply}>
          تطبيق الفلترة
        </Button>
      </div>

      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل تقرير المتأخرات"
        skeleton={<ReportTableSkeleton />}
      >
        {data && <DelaySection report={data} />}
      </AsyncLoader>
    </div>
  );
}