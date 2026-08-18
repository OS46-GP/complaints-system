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
  achievementDepartment: (department: string, filters?: ReportFilters) =>
    ["reporting-achievement-department", department, filters] as const,
  delayDepartment: (department: string, filters?: ReportFilters) =>
    ["reporting-delay-department", department, filters] as const,
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

export function useAchievementDepartmentComplaints(
  department: string | null,
  filters?: ReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: REPORTING_QUERY_KEYS.achievementDepartment(department ?? "", filters),
    queryFn: () => reportingApi.achievementDepartment(department!, filters),
    enabled: enabled && !!department,
  });
}

export function useDelayDepartmentComplaints(
  department: string | null,
  filters?: ReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: REPORTING_QUERY_KEYS.delayDepartment(department ?? "", filters),
    queryFn: () => reportingApi.delayDepartment(department!, filters),
    enabled: enabled && !!department,
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

export function useExportCustomReport() {
  return useMutation({
    mutationFn: (payload: CustomReportFilters & { format: ExportFormat }) =>
      reportingApi.exportCustomReport(payload),
  });
}

export function useDelayThresholds() {
  return useQuery({
    queryKey: ["settings-delay-thresholds"],
    queryFn: () => reportingApi.getDelayThresholds(),
  });
}

export function useUpdateDelayThresholds() {
  return useMutation({
    mutationFn: (payload: {
      lowDays: number;
      mediumDays: number;
      highDays: number;
    }) => reportingApi.updateDelayThresholds(payload),
  });
}

export function useAiDraftPeriodReport() {
  return useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) =>
      reportingApi.draftPeriodReport(from, to),
  });
}
