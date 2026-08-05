import { useState } from "react";
import { Filter } from "lucide-react";

import { AsyncLoader } from "@/components/shared/async-loader";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  lastYearRange,
  type DateRangeValue,
} from "@/features/reporting/components/date-range-picker";
import { ReportCardsSkeleton } from "@/features/reporting/components/report-skeletons";
import { ReportingFilterBar } from "@/features/reporting/components/reporting-filter-bar";
import { useAchievementReport, useDelayReport } from "@/features/reporting/hooks";
import type { ReportFilters } from "@/features/reporting/types";

import { useDashboardStatus } from "./dashboard-hooks";import { DashboardKpiCards } from "./kpi-cards";
import { DelaysChartCard } from "./delays-chart-card";
import { QuickActions, type QuickActionItem } from "./quick-actions";
import { StatusDonutCard } from "./status-donut-card";

export type { QuickActionItem } from "./quick-actions";

interface DashboardPageProps {
  quickActions: QuickActionItem[];
  delaysUrl?: string;
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
}: DashboardPageProps) {
  const [draftRange, setDraftRange] = useState<DateRangeValue>(lastYearRange());
  const [draftDepartment, setDraftDepartment] = useState("");
  const [applied, setApplied] = useState<ReportFilters>(lastYearRange());

  const achievement = useAchievementReport(applied);
  const delays = useDelayReport(applied);
  const status = useDashboardStatus(applied);

  const handleApply = () => {
    setApplied({
      from: draftRange.from || undefined,
      to: draftRange.to || undefined,
      department: draftDepartment || undefined,
    });
  };

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

      <ReportingFilterBar
        dateRange={draftRange}
        onDateRangeChange={setDraftRange}
        department={draftDepartment}
        onDepartmentChange={setDraftDepartment}
      />

      <div className="flex justify-end">
        <Button type="button" onClick={handleApply} className="gap-2">
          <Filter className="size-4" />
          تطبيق الفلترة
        </Button>
      </div>

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