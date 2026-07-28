import { complaintsApi } from "@/features/complaint-list/api";
import type { ApiComplaint } from "@/features/complaint-list/types";
import type { ComplaintDetailsData, ComplaintFileItem } from "@/features/complaint-detail/types";

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
    citizenName: api.citizen.fullName,
    citizenNationalId: api.citizen.nationalId || null,
    citizenMobile: api.citizen.mobileNumber || null,
    citizenAddress: api.citizen.address || null,
    citizenVillage: api.citizen.village || null,
    citizenDistrict: api.citizen.district || null,
    departmentName: api.department?.name ?? null,
    complaintTypeName: api.complaintType?.name ?? null,
    receptionMethodName: api.receptionMethod?.name ?? null,
    examinationStatusName: api.examinationStatus?.name ?? null,
    presentationStatusName: api.presentationStatus?.name ?? null,
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
