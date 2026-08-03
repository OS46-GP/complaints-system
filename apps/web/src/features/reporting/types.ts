export type ReportPeriod = {
  from: string;
  to: string;
};

export interface AchievementRow {
  department: string;
  total: number;
  finished: number;
  percentage: number;
}

export interface AchievementReport {
  period: ReportPeriod;
  governorateTotal: number;
  governorateFinished: number;
  governorateAchievement: number;
  departments: AchievementRow[];
}

export interface DelayRow {
  department: string;
  overdueCount: number;
  avgDaysOverdue: number;
}

export interface OverdueComplaint {
  id: string;
  complaintNumber: number;
  arrivalDate: string;
  citizenName: string;
  department: string | null;
  subject: string;
}

export interface DelayReport {
  period: ReportPeriod;
  overdueThresholdDays: number;
  totalOverdue: number;
  departments: DelayRow[];
  complaints: OverdueComplaint[];
}

export interface CustomReportComplaint {
  id: string;
  complaintNumber: number;
  statementYear: number;
  arrivalDate: string;
  subject: string;
  citizenName: string;
  citizenVillage: string | null;
  department: string | null;
  examinationStatus: string | null;
  severity: string | null;
}

export interface CustomReportResult {
  complaints: CustomReportComplaint[];
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byDepartment: Record<string, number>;
  };
}

export type ReportType = "ACHIEVEMENT" | "DELAY";

export interface GeneratedReport {
  id: string;
  type: ReportType;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  data: AchievementReport | DelayReport;
  format?: string | null;
  storageKey?: string | null;
}

export interface ScheduledReportsResponse {
  reports: GeneratedReport[];
  total: number;
  page: number;
  limit: number;
}

export type ExportFormat = "pdf" | "xlsx";

export interface ExportResult {
  downloadUrl: string;
  filename: string;
  mime: string;
}

export interface MemoResult {
  downloadUrl: string;
  filename: string;
  mime: string;
}

export interface ReportFilters {
  from?: string;
  to?: string;
  department?: string;
}

export interface CustomReportFilters {
  dateRange?: { from: string; to: string };
  village?: string;
  department?: string;
  examinationStatus?: string;
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  ACHIEVEMENT: "تقرير نسبة الإنجاز",
  DELAY: "تقرير المتأخرات",
};

export function getReportTypeLabel(type: ReportType): string {
  return REPORT_TYPE_LABELS[type] ?? type;
}
