import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { AsyncLoader } from "@/components/shared/async-loader";
import { Button } from "@/components/ui/button";
import { ReportsNav } from "@/features/reporting/components/reports-nav";
import { ReportingFilterBar } from "@/features/reporting/components/reporting-filter-bar";
import { ReportingSummaryCards } from "@/features/reporting/components/reporting-summary-cards";
import { AchievementSection } from "@/features/reporting/components/achievement-section";
import { DelaySection } from "@/features/reporting/components/delay-section";
import { ReportCardsSkeleton, ReportTableSkeleton } from "@/features/reporting/components/report-skeletons";
import { lastYearRange, type DateRangeValue } from "@/features/reporting/components/date-range-picker";
import { useAchievementReport, useDelayReport } from "@/features/reporting/hooks";
import type { ReportFilters } from "@/features/reporting/types";

interface ReportingDashboardProps {
  basePath: string;
}

export function ReportingDashboard({ basePath }: ReportingDashboardProps) {
  const [draftRange, setDraftRange] = useState<DateRangeValue>(lastYearRange());
  const [draftDepartment, setDraftDepartment] = useState("");
  const [applied, setApplied] = useState<ReportFilters>(lastYearRange());

  const {
    data: achievement,
    isLoading: achievementLoading,
    isError: achievementError,
    refetch: refetchAchievement,
  } = useAchievementReport(applied);

  const {
    data: delays,
    isLoading: delaysLoading,
    isError: delaysError,
    refetch: refetchDelays,
  } = useDelayReport(applied);

  const handleApply = () => {
    setApplied({
      from: draftRange.from || undefined,
      to: draftRange.to || undefined,
      department: draftDepartment || undefined,
    });
  };

  const totalOpen = achievement
    ? Math.max(0, achievement.governorateTotal - achievement.governorateFinished)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <ReportsNav basePath={basePath} />

      <PageHeader
        title="لوحة التقارير"
        description="نسب الإنجاز والمتأخرات على مستوى المحافظة والجهات"
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
        loading={achievementLoading}
        error={achievementError}
        onRetry={() => refetchAchievement()}
        errorText="تعذر تحميل تقرير الإنجاز"
        skeleton={<ReportCardsSkeleton />}
      >
        <ReportingSummaryCards
          achievement={achievement?.governorateAchievement ?? 0}
          totalOpen={totalOpen}
          totalOverdue={delays?.totalOverdue ?? 0}
        />
      </AsyncLoader>

      <AsyncLoader
        loading={achievementLoading}
        error={achievementError}
        onRetry={() => refetchAchievement()}
        errorText="تعذر تحميل تقرير الإنجاز"
        skeleton={<ReportTableSkeleton />}
      >
        {achievement && <AchievementSection report={achievement} />}
      </AsyncLoader>

      <AsyncLoader
        loading={delaysLoading}
        error={delaysError}
        onRetry={() => refetchDelays()}
        errorText="تعذر تحميل تقرير المتأخرات"
        skeleton={<ReportTableSkeleton />}
      >
        {delays && <DelaySection report={delays} />}
      </AsyncLoader>
    </div>
  );
}
