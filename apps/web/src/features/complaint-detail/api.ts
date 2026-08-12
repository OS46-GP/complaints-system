import { complaintsApi } from "@/features/complaint-list/api";
import type {
  ApiComplaint,
  ApiComplaintDepartment,
  ApiComplaintUrgency,
  RecurrenceMatch,
} from "@/features/complaint-list/types";
import type {
  ComplaintDetailsData,
  DepartmentAssignment,
  UrgencyEntry,
} from "@/features/complaint-detail/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function resolveUploadUrl(storageKey: string): string {
  return `${API_BASE}/uploads/${storageKey}`;
}

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH";

export interface AnalyzeResponse {
  severity: SeverityLevel;
  recurrenceMatches: RecurrenceMatch[];
}

function toAssignment(entry: ApiComplaintDepartment): DepartmentAssignment {
  return {
    id: entry.id,
    assignmentIndex: entry.assignmentIndex,
    departmentId: entry.department.id,
    departmentName: entry.department.name,
    departmentSubAuthority: entry.department.subAuthority ?? null,
    outgoingLetterNumber: entry.outgoingLetterNumber ?? null,
    outgoingLetterDate: entry.outgoingLetterDate ?? null,
    responseDeadlineDays: entry.responseDeadlineDays ?? null,
    responseText: entry.responseText ?? null,
    responseNumber: entry.responseNumber ?? null,
    responseDate: entry.responseDate ?? null,
    importDate: entry.importDate ?? null,
    examinationStatusName: entry.examinationStatus?.name ?? null,
    examinationResult: entry.examinationResult ?? null,
    respondedAt: entry.respondedAt ?? null,
    createdAt: entry.createdAt,
    endedAt: entry.endedAt ?? null,
    status: entry.assignmentStatus,
  };
}

function toDepartmentSummaries(history: DepartmentAssignment[]) {
  const latestByDepartment = new Map<string, DepartmentAssignment>();
  for (const assignment of history) {
    const current = latestByDepartment.get(assignment.departmentId);
    if (
      !current ||
      assignment.assignmentIndex > current.assignmentIndex ||
      (assignment.assignmentIndex === current.assignmentIndex &&
        assignment.createdAt > current.createdAt)
    ) {
      latestByDepartment.set(assignment.departmentId, assignment);
    }
  }
  return [...latestByDepartment.values()].map((assignment) => ({
    id: assignment.departmentId,
    name: assignment.departmentName,
    assignmentStatus: assignment.status,
    assignmentId: assignment.id,
    assignmentIndex: assignment.assignmentIndex,
    responseText: assignment.responseText,
    responseNumber: assignment.responseNumber,
    responseDate: assignment.responseDate,
    importDate: assignment.importDate,
    examinationStatusName: assignment.examinationStatusName,
    examinationResult: assignment.examinationResult,
    respondedAt: assignment.respondedAt,
    outgoingLetterNumber: assignment.outgoingLetterNumber,
    outgoingLetterDate: assignment.outgoingLetterDate,
    responseDeadlineDays: assignment.responseDeadlineDays,
    endedAt: assignment.endedAt,
  }));
}

function toUrgency(entry: ApiComplaintUrgency): UrgencyEntry {
  return {
    id: entry.id,
    departmentId: entry.department.id,
    departmentName: entry.department.name,
    departmentSubAuthority: entry.department.subAuthority ?? null,
    assignmentId: entry.assignmentId ?? null,
    outgoingLetterNumber: entry.outgoingLetterNumber,
    outgoingLetterDate: entry.outgoingLetterDate,
    createdAt: entry.createdAt,
  };
}

function fallbackAssignment(api: ApiComplaint): DepartmentAssignment {
  const departmentName = api.department?.name ?? null;
  return {
    id: `synthetic-${api.department?.id ?? "unknown"}`,
    assignmentIndex: 1,
    departmentId: api.department?.id ?? "",
    departmentName: departmentName ?? "—",
    departmentSubAuthority: api.department?.subAuthority ?? null,
    outgoingLetterNumber: null,
    outgoingLetterDate: null,
    responseDeadlineDays: null,
    responseText: null,
    responseNumber: null,
    responseDate: null,
    importDate: null,
    examinationStatusName: null,
    examinationResult: null,
    respondedAt: null,
    createdAt: api.createdAt,
    endedAt: null,
    status: "ACTIVE",
  };
}

function mapToDetails(api: ApiComplaint): ComplaintDetailsData {
  const assignmentHistory =
    api.departments?.length > 0
      ? api.departments.map(toAssignment)
      : api.department
        ? [fallbackAssignment(api)]
        : [];

  return {
    id: api.id,
    displayId: `#${api.complaintNumber}-${api.statementYear}`,
    complaintNumber: api.complaintNumber,
    statementYear: api.statementYear,
    arrivalDate: api.arrivalDate,
    severity: api.severity,
    subject: api.subject,
    annotation: api.annotation,
    caseStatus: api.caseStatus,
    authorityResponseText: api.authorityResponseText ?? null,
    authorityResponseDate: api.authorityResponseDate ?? null,
    incomingResponseNumber: api.incomingResponseNumber ?? null,
    archiveNumber: api.archiveNumber ?? null,
    archiveDate: api.archiveDate ?? null,
    archiveLocation: api.archiveLocation ?? null,
    citizenName: api.citizen.fullName,
    citizenNationalId: api.citizen.nationalId || null,
    citizenMobile: api.citizen.mobileNumber || null,
    citizenAddress: api.citizen.address || null,
    citizenVillage: api.citizen.village || null,
    citizenDistrict: api.citizen.district || null,
    departments: toDepartmentSummaries(assignmentHistory),
    assignmentHistory,
    urgencies: (api.urgencies ?? []).map(toUrgency),
    complaintTypeName: api.complaintType?.name ?? null,
    complaintTypeId: api.complaintType?.id ?? null,
    receptionMethodName: api.receptionMethod?.name ?? null,
    receptionMethodId: api.receptionMethod?.id ?? null,
    examinationStatusName: api.examinationStatus?.name ?? null,
    examinationStatusId: api.examinationStatus?.id ?? null,
    respondentName: api.respondentName ?? null,
    createdBy: api.createdBy?.username ?? null,
    createdAt: api.createdAt,
    files: (api.files ?? []).map((f) => ({
      id: f.id,
      fileType: f.fileType,
      storageKey: f.storageKey,
      uploadedAt: f.uploadedAt,
    })),
  };
}

export async function getComplaintDetails(id: string) {
  const api = await complaintsApi.getById(id);
  return mapToDetails(api);
}

export async function getComplaintLinks(id: string): Promise<RecurrenceMatch[]> {
  const data = await complaintsApi.getLinks(id);
  return data.recurrenceMatches;
}

export async function analyzeComplaint(id: string): Promise<AnalyzeResponse> {
  return complaintsApi.analyze(id);
}

export async function updateComplaintSeverity(
  id: string,
  severity: SeverityLevel,
): Promise<{ severity: SeverityLevel }> {
  return complaintsApi.updateSeverity(id, severity);
}

const CASE_STATUS_ALIASES: Record<"FINISHED" | "NOT_FINISHED", string[]> = {
  FINISHED: ["تم الفحص", "مستوفي", "غير مستوفي", "منتهي"],
  NOT_FINISHED: ["قيد الفحص", "غير منتهي"],
};

export async function updateComplaintCaseStatus(
  id: string,
  caseStatus: "FINISHED" | "NOT_FINISHED",
): Promise<{ caseStatus: "FINISHED" | "NOT_FINISHED" }> {
  const statuses = await complaintsApi.getExaminationStatuses();
  const aliases = CASE_STATUS_ALIASES[caseStatus];
  const target =
    statuses.find((status) => status.name === aliases[0]) ??
    statuses.find((status) => aliases.includes(status.name));
  if (!target) {
    throw new Error(`No examination status matching ${caseStatus}`);
  }
  await complaintsApi.update(id, { examinationStatusId: target.id });
  return { caseStatus };
}

export async function unlinkComplaints(
  id: string,
  targetId: string,
): Promise<{ unlinked: boolean }> {
  return complaintsApi.unlinkComplaints(id, targetId);
}
