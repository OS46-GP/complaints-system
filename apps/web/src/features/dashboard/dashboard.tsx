import { useMemo } from "react";

import { AsyncLoader } from "@/components/shared/async-loader";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  currentMonthRange,
  lastYearRange,
} from "@/features/reporting/components/date-range-picker";
import { ReportCardsSkeleton } from "@/features/reporting/components/report-skeletons";
import { ReportingFilterBar } from "@/features/reporting/components/reporting-filter-bar";
import { useReportFilters } from "@/features/reporting/use-report-filters";
import { useAchievementReport, useDelayReport } from "@/features/reporting/hooks";
import type { ReportFilters } from "@/features/reporting/types";
import { usePreferences } from "@/features/settings/preferences/store";

import { useDashboardStatus } from "./dashboard-hooks";import { DashboardKpiCards } from "./kpi-cards";
import { DelaysChartCard } from "./delays-chart-card";
import { DueAssignmentsCard } from "@/features/due-assignments/due-assignments-card";
import { QuickActions, type QuickActionItem } from "./quick-actions";
import { StatusDonutCard } from "./status-donut-card";

export type { QuickActionItem } from "./quick-actions";

interface DashboardPageProps {
  quickActions: QuickActionItem[];
  delaysUrl?: string;
  dueAssignmentsUrl?: string;
}

function ChartCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-container-lowest p-6">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export function DashboardPage({
  quickActions,
  delaysUrl,
  dueAssignmentsUrl,
}: DashboardPageProps) {
  const { preferences } = usePreferences();
  const defaultRange = useMemo(
    (): ReportFilters =>
      preferences.dashboard.dateRange === "currentMonth"
        ? currentMonthRange()
        : lastYearRange(),
    [preferences.dashboard.dateRange],
  );
  const { filters, setFilters } = useReportFilters(defaultRange);

  const achievement = useAchievementReport(filters);
  const delays = useDelayReport(filters);
  const status = useDashboardStatus(filters);

  const total = achievement.data?.governorateTotal ?? 0;
  const finished = achievement.data?.governorateFinished ?? 0;
  const open = Math.max(0, total - finished);
  const achievementRate = achievement.data?.governorateAchievement ?? 0;
  const totalOverdue = delays.data?.totalOverdue ?? 0;
  const byStatus = status.data?.summary.byStatus ?? {};
  const statusTotal = status.data?.summary.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="لوحة المتابعة الرئيسية"
        description="نظرة عامة على الشكاوى والمؤشرات الرئيسية للنظام"
      />

      <QuickActions items={quickActions} />

      <DueAssignmentsCard detailsUrl={dueAssignmentsUrl} />

      <ReportingFilterBar value={filters} onChange={setFilters} />

      <AsyncLoader
        loading={achievement.isLoading || delays.isLoading}
        error={achievement.isError || delays.isError}
        onRetry={() => {
          void achievement.refetch();
          void delays.refetch();
        }}
        errorText="تعذر تحميل مؤشرات لوحة المتابعة"
        skeleton={<ReportCardsSkeleton />}
      >
        <DashboardKpiCards
          total={total}
          open={open}
          achievement={achievementRate}
          totalOverdue={totalOverdue}
        />
      </AsyncLoader>

      <AsyncLoader
        loading={status.isLoading}
        error={status.isError}
        onRetry={() => status.refetch()}
        errorText="تعذر تحميل توزيع الشكاوى"
        skeleton={<ChartCardSkeleton />}
      >
        <StatusDonutCard byStatus={byStatus} total={statusTotal} />
      </AsyncLoader>

      <AsyncLoader
        loading={delays.isLoading}
        error={delays.isError}
        onRetry={() => delays.refetch()}
        errorText="تعذر تحميل تقرير المتأخرات"
        skeleton={<ChartCardSkeleton />}
      >
        {delays.data && (
          <DelaysChartCard report={delays.data} detailsUrl={delaysUrl} />
        )}
      </AsyncLoader>
    </div>
  );
}