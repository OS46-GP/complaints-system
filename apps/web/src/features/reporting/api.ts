import { axiosClient } from "@/api/axios-client";
import type {
  CustomReportFilters,
  CustomReportResult,
  DelayDepartmentComplaintsResult,
  DepartmentComplaintsResult,
  ExportFormat,
  ExportResult,
  GeneratedReport,
  MemoResult,
  ReportFilters,
  ReportType,
  ScheduledReportsResponse,
  AchievementReport,
  DelayReport,
  DelayThresholds,
} from "@/features/reporting/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function resolveDownloadUrl(relativePath: string): string {
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  return `${API_BASE}${relativePath}`;
}

export interface GenerateReportPayload {
  type: ReportType;
  from: string;
  to: string;
}

export interface ScheduledReportsParams {
  type?: ReportType;
  page?: number;
  limit?: number;
}

export const reportingApi = {
  achievement: (filters?: ReportFilters) =>
    axiosClient
      .get<AchievementReport>("/api/reports/achievement", {
        params: {
          department: filters?.department || undefined,
          from: filters?.from || undefined,
          to: filters?.to || undefined,
          village: filters?.village || undefined,
          status: filters?.status || undefined,
          severity: filters?.severity || undefined,
        },
      })
      .then((res) => res.data),

  delays: (filters?: ReportFilters) =>
    axiosClient
      .get<DelayReport>("/api/reports/delays", {
        params: {
          department: filters?.department || undefined,
          from: filters?.from || undefined,
          to: filters?.to || undefined,
          village: filters?.village || undefined,
          status: filters?.status || undefined,
          severity: filters?.severity || undefined,
          sortBy: filters?.sortBy || undefined,
          order: filters?.sortOrder || undefined,
        },
      })
      .then((res) => res.data),

  achievementDepartment: (department: string, filters?: ReportFilters) =>
    axiosClient
      .get<DepartmentComplaintsResult>("/api/reports/achievement/department", {
        params: {
          department,
          from: filters?.from || undefined,
          to: filters?.to || undefined,
          village: filters?.village || undefined,
          status: filters?.status || undefined,
          severity: filters?.severity || undefined,
        },
      })
      .then((res) => res.data),

  delayDepartment: (department: string, filters?: ReportFilters) =>
    axiosClient
      .get<DelayDepartmentComplaintsResult>("/api/reports/delays/department", {
        params: {
          department,
          from: filters?.from || undefined,
          to: filters?.to || undefined,
          village: filters?.village || undefined,
          status: filters?.status || undefined,
          severity: filters?.severity || undefined,
        },
      })
      .then((res) => res.data),

  custom: (payload: CustomReportFilters) =>
    axiosClient
      .post<CustomReportResult>("/api/reports/custom", payload)
      .then((res) => res.data),

  exportCustomReport: (payload: CustomReportFilters & { format: ExportFormat }) =>
    axiosClient
      .post<ExportResult>("/api/reports/custom/export", payload)
      .then((res) => res.data),

  scheduled: (params?: ScheduledReportsParams) =>
    axiosClient
      .get<ScheduledReportsResponse>("/api/reports/scheduled", {
        params: {
          type: params?.type || undefined,
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
      })
      .then((res) => res.data),

  generate: (payload: GenerateReportPayload) =>
    axiosClient
      .post<GeneratedReport>("/api/reports/generate", payload)
      .then((res) => res.data),

  exportReport: (id: string, format: ExportFormat) =>
    axiosClient
      .get<ExportResult>(`/api/reports/${id}/export`, { params: { format } })
      .then((res) => res.data),

  memo: (complaintId: string) =>
    axiosClient
      .post<MemoResult>(`/api/complaints/${complaintId}/memo`)
      .then((res) => res.data),

  getDelayThresholds: () =>
    axiosClient
      .get<DelayThresholds>("/api/settings/delay-thresholds")
      .then((res) => res.data),

  updateDelayThresholds: (payload: {
    lowDays: number;
    mediumDays: number;
    highDays: number;
  }) =>
    axiosClient
      .put<DelayThresholds>("/api/settings/delay-thresholds", payload)
      .then((res) => res.data),

  draftPeriodReport: (from: string, to: string) =>
    axiosClient
      .post<{ draft: string }>("/api/ai/draft-report", { from, to })
      .then((res) => res.data),
};
