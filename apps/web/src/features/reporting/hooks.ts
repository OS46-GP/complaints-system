import { useQuery, useMutation } from "@tanstack/react-query";

import {
  reportingApi,
  type GenerateReportPayload,
  type ScheduledReportsParams,
} from "@/features/reporting/api";
import type {
  CustomReportFilters,
  ExportFormat,
  ReportFilters,
} from "@/features/reporting/types";

export const REPORTING_QUERY_KEYS = {
  achievement: (filters?: ReportFilters) =>
    ["reporting-achievement", filters] as const,
  delays: (filters?: ReportFilters) => ["reporting-delays", filters] as const,
  scheduled: (params?: ScheduledReportsParams) =>
    ["reporting-scheduled", params] as const,
};

export function useAchievementReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: REPORTING_QUERY_KEYS.achievement(filters),
    queryFn: () => reportingApi.achievement(filters),
  });
}

export function useDelayReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: REPORTING_QUERY_KEYS.delays(filters),
    queryFn: () => reportingApi.delays(filters),
  });
}

export function useCustomReport() {
  return useMutation({
    mutationFn: (payload: CustomReportFilters) => reportingApi.custom(payload),
  });
}

export function useScheduledReports(params?: ScheduledReportsParams) {
  return useQuery({
    queryKey: REPORTING_QUERY_KEYS.scheduled(params),
    queryFn: () => reportingApi.scheduled(params),
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: (payload: GenerateReportPayload) =>
      reportingApi.generate(payload),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: ExportFormat }) =>
      reportingApi.exportReport(id, format),
  });
}

export function useGenerateMemo() {
  return useMutation({
    mutationFn: (complaintId: string) => reportingApi.memo(complaintId),
  });
}
