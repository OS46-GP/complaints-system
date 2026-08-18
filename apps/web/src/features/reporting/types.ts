export type ReportPeriod = {
  from: string;
  to: string;
};

export type ReportStatusFilter = "FINISHED" | "NOT_FINISHED";
export type ReportSeverityFilter = "Low" | "Medium" | "High";

export interface AchievementComplaint {
  id: string;
  complaintNumber: number;
  subject: string;
  citizenName: string;
  arrivalDate: string;
  finished: boolean;
  severity: string | null;
}

export interface AchievementRow {
  department: string;
  total: number;
  finished: number;
  percentage: number;
  complaints?: AchievementComplaint[];
}

export interface DepartmentComplaintsResult {
  department: string;
  complaints: AchievementComplaint[];
}

export interface DelayDepartmentComplaintsResult {
  department: string;
  complaints: OverdueComplaint[];
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
  severity: string | null;
}

export interface DelayReport {
  period: ReportPeriod;
  thresholds: {
    Low: number;
    Medium: number;
    High: number;
  };
  overdueThresholdDays: number;
  totalOverdue: number;
  departments: DelayRow[];
  complaints?: OverdueComplaint[];
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

export interface DelayThresholds {
  id: number;
  lowDays: number;
  mediumDays: number;
  highDays: number;
  updatedAt: string;
}

export interface ReportFilters {
  from?: string;
  to?: string;
  department?: string;
  village?: string;
  status?: ReportStatusFilter;
  severity?: ReportSeverityFilter;
  sortBy?: "overdueCount" | "avgDaysOverdue";
  sortOrder?: "asc" | "desc";
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
