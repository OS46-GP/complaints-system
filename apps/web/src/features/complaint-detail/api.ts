import { complaintsApi } from "@/features/complaint-list/api";
import type { ApiComplaint, RecurrenceMatch } from "@/features/complaint-list/types";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function resolveUploadUrl(storageKey: string): string {
  return `${API_BASE}/uploads/${storageKey}`;
}

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH";

export interface AnalyzeResponse {
  severity: SeverityLevel;
  recurrenceMatches: RecurrenceMatch[];
}

function mapToDetails(api: ApiComplaint): ComplaintDetailsData {
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
    departments:
      api.departments?.length > 0
        ? api.departments.map((entry) => ({
            id: entry.department.id,
            name: entry.department.name,
          }))
        : api.department
          ? [{ id: api.department.id, name: api.department.name }]
          : [],
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

const EXAMINATION_STATUS_NAMES: Record<"FINISHED" | "NOT_FINISHED", string> = {
  FINISHED: "تم الفحص",
  NOT_FINISHED: "قيد الفحص",
};

export async function updateComplaintCaseStatus(
  id: string,
  caseStatus: "FINISHED" | "NOT_FINISHED",
): Promise<{ caseStatus: "FINISHED" | "NOT_FINISHED" }> {
  const statuses = await complaintsApi.getExaminationStatuses();
  const target = statuses.find(
    (status) => status.name === EXAMINATION_STATUS_NAMES[caseStatus],
  );
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
