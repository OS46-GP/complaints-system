import { complaintsApi } from "@/features/complaint-list/api";
import type { ApiComplaint, RecurrenceMatch } from "@/features/complaint-list/types";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";

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
    departmentName: api.department?.name ?? null,
    departmentId: api.department?.id ?? null,
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

export async function unlinkComplaints(
  id: string,
  targetId: string,
): Promise<{ unlinked: boolean }> {
  return complaintsApi.unlinkComplaints(id, targetId);
}
