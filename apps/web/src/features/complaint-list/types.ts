export interface ApiCitizen {
  id: string;
  fullName: string;
  nationalId: string;
  mobileNumber: string;
  address: string;
  village: string | null;
  district: string | null;
}

export interface ApiDepartment {
  id: string;
  name: string;
  subAuthority: string | null;
}

export interface ApiComplaintType {
  id: number;
  name: string;
}

export interface ApiExaminationStatus {
  id: number;
  name: string;
}

export interface ApiCreatedBy {
  id: string;
  username: string;
  role: string;
}

export interface ApiComplaint {
  id: string;
  complaintNumber: number;
  statementYear: number;
  arrivalDate: string;
  severity: "Low" | "Medium" | "High";
  subject: string;
  respondentName: string | null;
  annotation: string | null;
  createdAt: string;
  citizen: ApiCitizen;
  department: ApiDepartment | null;
  complaintType: ApiComplaintType | null;
  examinationStatus: ApiExaminationStatus | null;
  createdBy: ApiCreatedBy | null;
  caseStatus: "FINISHED" | "NOT_FINISHED" | null;
}

export interface PaginatedComplaintResponse {
  data: ApiComplaint[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const SEVERITY_LABELS: Record<string, string> = {
  High: "عالية",
  Medium: "متوسطة",
  Low: "منخفضة",
};

export const CASE_STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  FINISHED: { label: "تم الفحص", variant: "default" },
  NOT_FINISHED: { label: "قيد الفحص", variant: "secondary" },
};

export interface ComplaintItem {
  id: string;
  complaintNumber: number;
  statementYear: number;
  displayId: string;
  subject: string;
  citizenName: string;
  departmentName: string;
  categoryName: string;
  severity: "Low" | "Medium" | "High";
  severityLabel: string;
  caseStatus: "FINISHED" | "NOT_FINISHED" | null;
  examinationStatusName: string;
  statusLabel: string;
  statusVariant: "default" | "secondary" | "destructive" | "outline";
  createdBy: string;
  createdAt: string;
}

export function mapApiComplaint(api: ApiComplaint): ComplaintItem {
  const statusConfig = api.caseStatus
    ? CASE_STATUS_LABELS[api.caseStatus]
    : { label: api.examinationStatus?.name ?? "-", variant: "outline" as const };

  return {
    id: api.id,
    complaintNumber: api.complaintNumber,
    statementYear: api.statementYear,
    displayId: `#${api.complaintNumber}-${api.statementYear}`,
    subject: api.subject,
    citizenName: api.citizen.fullName,
    departmentName: api.department?.name ?? "-",
    categoryName: api.complaintType?.name ?? "-",
    severity: api.severity,
    severityLabel: SEVERITY_LABELS[api.severity] ?? api.severity,
    caseStatus: api.caseStatus,
    examinationStatusName: api.examinationStatus?.name ?? "-",
    statusLabel: statusConfig.label,
    statusVariant: statusConfig.variant,
    createdBy: api.createdBy?.username ?? "-",
    createdAt: api.createdAt
      ? new Date(api.createdAt).toLocaleDateString("ar-SA")
      : "-",
  };
}
