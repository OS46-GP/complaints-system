import { useMemo } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ReportingFilterBar } from "@/features/reporting/components/reporting-filter-bar";
import { ReportingSummaryCards } from "@/features/reporting/components/reporting-summary-cards";
import { AchievementSection } from "@/features/reporting/components/achievement-section";
import { DelaySection } from "@/features/reporting/components/delay-section";
import { ReportSection } from "@/features/reporting/components/report-section";
import { ReportCardsSkeleton, ReportTableSkeleton } from "@/features/reporting/components/report-skeletons";
import { lastYearRange } from "@/features/reporting/components/date-range-picker";
import { useReportFilters } from "@/features/reporting/use-report-filters";
import { useAchievementReport, useDelayReport } from "@/features/reporting/hooks";

export function AnalyticsDashboard() {
  const defaults = useMemo(() => lastYearRange(), []);
  const { filters, setFilters } = useReportFilters(defaults);

  const {
    data: achievement,
    isLoading: achievementLoading,
    isError: achievementError,
    refetch: refetchAchievement,
  } = useAchievementReport(filters);

  const {
    data: delays,
    isLoading: delaysLoading,
    isError: delaysError,
    refetch: refetchDelays,
  } = useDelayReport(filters);

  const totalOpen = achievement
    ? Math.max(0, achievement.governorateTotal - achievement.governorateFinished)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="التحليلات"
        description="نسب الإنجاز والمتأخرات على مستوى المحافظة والجهات"
      />

      <ReportingFilterBar value={filters} onChange={setFilters} showVillage />

      <ReportSection
        title="ملخص سريع"
        loading={achievementLoading}
        error={achievementError}
        onRetry={() => refetchAchievement()}
        errorText="تعذر تحميل ملخص التقارير"
        skeleton={<ReportCardsSkeleton />}
      >
        <ReportingSummaryCards
          achievement={achievement?.governorateAchievement ?? 0}
          total={achievement?.governorateTotal ?? 0}
          finished={achievement?.governorateFinished ?? 0}
          totalOpen={totalOpen}
          totalOverdue={delays?.totalOverdue ?? 0}
        />
      </ReportSection>

      <ReportSection
        loading={achievementLoading}
        error={achievementError}
        onRetry={() => refetchAchievement()}
        errorText="تعذر تحميل تقرير الإنجاز"
        skeleton={<ReportTableSkeleton />}
      >
        {achievement && (
          <AchievementSection report={achievement} filters={filters} showTotals={false} />
        )}
      </ReportSection>

      <ReportSection
        loading={delaysLoading}
        error={delaysError}
        onRetry={() => refetchDelays()}
        errorText="تعذر تحميل تقرير المتأخرات"
        skeleton={<ReportTableSkeleton />}
      >
        {delays && <DelaySection report={delays} filters={filters} />}
      </ReportSection>
    </div>
  );
}