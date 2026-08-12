export interface ApiCitizen {
  id: string;
  fullName: string;
  nationalId: string;
  mobileNumber: string;
  address: string;
  village: string | null;
  district: string | null;
  locationCode: string | null;
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

export interface ApiComplaintFile {
  id: string;
  fileType: string;
  storageKey: string;
  uploadedAt: string;
}

export type AssignmentStatus =
  | "RESPONDED"
  | "ACTIVE"
  | "OVERDUE"
  | "ENDED_WITHOUT_RESPONSE"
  | "ENDED_WITH_RESPONSE";

export interface ApiComplaintDepartment {
  id: string;
  complaintId: string;
  departmentId: string;
  department: ApiDepartment;
  assignmentIndex: number;
  createdAt: string;
  endedAt: string | null;
  assignmentStatus: AssignmentStatus;
  responseText: string | null;
  responseNumber: string | null;
  responseDate: string | null;
  importDate: string | null;
  examinationStatus: ApiExaminationStatus | null;
  examinationResult: string | null;
  respondedAt: string | null;
  outgoingLetterNumber: string | null;
  outgoingLetterDate: string | null;
  responseDeadlineDays: number | null;
}

export interface ApiComplaintUrgency {
  id: string;
  complaintId: string;
  departmentId: string;
  department: ApiDepartment;
  assignmentId: string | null;
  outgoingLetterNumber: string;
  outgoingLetterDate: string;
  createdAt: string;
}

export interface DueAssignmentRow {
  assignmentId: string;
  assignmentIndex: number;
  createdAt: string;
  complaintId: string;
  complaintNumber: number;
  statementYear: number;
  subject: string;
  citizenName: string | null;
  departmentId: string;
  departmentName: string;
  departmentSubAuthority: string | null;
  outgoingLetterNumber: string | null;
  outgoingLetterDate: string | null;
  responseDeadlineDays: number | null;
  dueDate: string;
  status: "ACTIVE" | "OVERDUE";
}

export interface DueAssignmentsResponse {
  endingToday: DueAssignmentRow[];
  overdue: DueAssignmentRow[];
  counts: { endingToday: number; overdue: number };
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
  authorityResponseText: string | null;
  authorityResponseDate: string | null;
  incomingResponseNumber: string | null;
  archiveNumber: string | null;
  archiveDate: string | null;
  archiveLocation: string | null;
  createdAt: string;
  citizen: ApiCitizen;
  department: ApiDepartment | null;
  departments: ApiComplaintDepartment[];
  urgencies: ApiComplaintUrgency[];
  complaintType: ApiComplaintType | null;
  receptionMethod: ApiReferenceItem | null;
  examinationStatus: ApiExaminationStatus | null;
  createdBy: ApiCreatedBy | null;
  caseStatus: "FINISHED" | "NOT_FINISHED" | null;
  files: ApiComplaintFile[];
}

export interface ApiReferenceItem {
  id: number;
  name: string;
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

export interface Department {
  id: string;
  name: string;
  subAuthority: string | null;
}

export interface ReferenceItem {
  id: number;
  name: string;
}

export interface LocationItem {
  code: string;
  name: string;
  parentCode: string | null;
  level: number;
  levelDesc: string | null;
}

export interface RecurrenceMatch {
  id: string;
  complaintNumber: number;
  statementYear: number;
  arrivalDate: string;
  subject: string;
  examinationStatus: string | null;
  endDate: string | null;
  actions: {
    id: string;
    action: string;
    actionDate: string;
    notes: string | null;
  }[];
}

export interface CheckDuplicatesPayload {
  subject: string;
  annotation?: string;
  departmentId?: string;
  arrivalDate?: string;
  citizen?: {
    nationalId?: string;
    village?: string;
    district?: string;
  };
}

export interface FieldResult {
  value: string;
  confidence: number;
}

export interface OcrIntakeResult {
  fields: Record<string, FieldResult>;
  imageUrl: string;
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
