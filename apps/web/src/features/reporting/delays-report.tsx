import { useMemo } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ReportingFilterBar } from "@/features/reporting/components/reporting-filter-bar";
import { DelaySection } from "@/features/reporting/components/delay-section";
import { ReportsNav } from "@/features/reporting/components/reports-nav";
import { ReportSection } from "@/features/reporting/components/report-section";
import { ReportTableSkeleton } from "@/features/reporting/components/report-skeletons";
import {
  lastYearRange,
} from "@/features/reporting/components/date-range-picker";
import { useReportFilters } from "@/features/reporting/use-report-filters";
import { useDelayReport } from "@/features/reporting/hooks";

interface DelaysReportPageProps {
  basePath: string;
}

export function DelaysReportPage({ basePath }: DelaysReportPageProps) {
  const defaults = useMemo(() => lastYearRange(), []);
  const { filters, setFilters } = useReportFilters(defaults);

  const { data, isLoading, isError, refetch } = useDelayReport(filters);

  return (
    <div className="flex flex-col gap-6">
      <ReportsNav basePath={basePath} />

      <PageHeader
        title="تقرير المتأخرات حسب الجهة"
        description="جميع الجهات وعدد الشكاوى المتأخرة عنها ومتوسط أيام التأخير"
      />

      <ReportingFilterBar
        value={filters}
        onChange={setFilters}
        showVillage
        showSort
      />

      <ReportSection
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل تقرير المتأخرات"
        skeleton={<ReportTableSkeleton />}
      >
        {data && <DelaySection report={data} />}
      </ReportSection>
    </div>
  );
}