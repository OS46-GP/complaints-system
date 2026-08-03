import { axiosClient } from "@/api/axios-client";
import type {
  CustomReportFilters,
  CustomReportResult,
  ExportFormat,
  ExportResult,
  GeneratedReport,
  MemoResult,
  ReportFilters,
  ReportType,
  ScheduledReportsResponse,
  AchievementReport,
  DelayReport,
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
        },
      })
      .then((res) => res.data),

  custom: (payload: CustomReportFilters) =>
    axiosClient
      .post<CustomReportResult>("/api/reports/custom", payload)
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
};
