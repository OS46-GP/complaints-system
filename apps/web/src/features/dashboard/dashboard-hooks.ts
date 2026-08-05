import { useQuery } from "@tanstack/react-query";

import { reportingApi } from "@/features/reporting/api";
import type { ReportFilters } from "@/features/reporting/types";

export const DASHBOARD_QUERY_KEYS = {
  status: (filters?: ReportFilters) => ["dashboard-status", filters] as const,
};

export function useDashboardStatus(filters?: ReportFilters) {
  const { from, to, department } = filters ?? {};

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.status(filters),
    queryFn: () =>
      reportingApi.custom({
        dateRange:
          from && to ? { from, to } : undefined,
        department: department || undefined,
      }),
  });
}