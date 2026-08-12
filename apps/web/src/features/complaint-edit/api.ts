import { complaintsApi, type UpdateComplaintPayload } from "@/features/complaint-list/api";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";
import type { ComplaintCreateFormData } from "@/features/complaint-create/types";

export function mapDetailsToForm(details: ComplaintDetailsData): ComplaintCreateFormData {
  return {
    subject: details.subject,
    complaintTypeId: details.complaintTypeId ? String(details.complaintTypeId) : "",
    severity: details.severity,
    receptionMethodId: details.receptionMethodId ? String(details.receptionMethodId) : "",
    departments: details.departments.map((department) => ({
      departmentId: department.id,
      outgoingLetterNumber: department.outgoingLetterNumber ?? "",
      outgoingLetterDate: department.outgoingLetterDate
        ? department.outgoingLetterDate.slice(0, 10)
        : "",
      responseDeadlineDays: department.responseDeadlineDays
        ? String(department.responseDeadlineDays)
        : "",
    })),
    annotation: details.annotation ?? "",
    citizen: {
      fullName: details.citizenName,
      nationalId: details.citizenNationalId ?? "",
      mobileNumber: details.citizenMobile ?? "",
      address: details.citizenAddress ?? "",
      village: details.citizenVillage ?? "",
      district: details.citizenDistrict ?? "",
    },
    files: [],
  };
}

export function buildDepartmentAssignments(data: ComplaintCreateFormData) {
  return data.departments
    .filter((department) => department.departmentId.trim())
    .map((department) => ({
      departmentId: department.departmentId,
      outgoingLetterNumber: department.outgoingLetterNumber.trim(),
      outgoingLetterDate: department.outgoingLetterDate,
      responseDeadlineDays: department.responseDeadlineDays
        ? Number(department.responseDeadlineDays)
        : undefined,
    }));
}

export async function updateComplaint(
  id: string,
  data: ComplaintCreateFormData,
) {
  const payload: UpdateComplaintPayload = {
    subject: data.subject || undefined,
    severity: data.severity,
    receptionMethodId: data.receptionMethodId ? Number(data.receptionMethodId) : undefined,
    complaintTypeId: data.complaintTypeId ? Number(data.complaintTypeId) : undefined,
    departments: buildDepartmentAssignments(data),
    annotation: data.annotation || undefined,
    citizen: {
      fullName: data.citizen.fullName || undefined,
      nationalId: data.citizen.nationalId || undefined,
      mobileNumber: data.citizen.mobileNumber || undefined,
      address: data.citizen.address || undefined,
      village: data.citizen.village || undefined,
      district: data.citizen.district || undefined,
    },
  };

  return complaintsApi.update(id, payload);
}