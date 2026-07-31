import { complaintsApi, type UpdateComplaintPayload } from "@/features/complaint-list/api";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";
import type { ComplaintCreateFormData } from "@/features/complaint-create/types";

export function mapDetailsToForm(details: ComplaintDetailsData): ComplaintCreateFormData {
  return {
    subject: details.subject,
    complaintTypeId: details.complaintTypeId ? String(details.complaintTypeId) : "",
    severity: details.severity,
    receptionMethodId: details.receptionMethodId ? String(details.receptionMethodId) : "",
    respondentName: details.respondentName ?? "",
    departmentId: details.departmentId ?? "",
    annotation: details.annotation ?? "",
    presentationStatusId: details.presentationStatusId ? String(details.presentationStatusId) : "",
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

export async function updateComplaint(
  id: string,
  data: ComplaintCreateFormData,
) {
  const payload: UpdateComplaintPayload = {
    subject: data.subject || undefined,
    severity: data.severity,
    receptionMethodId: data.receptionMethodId ? Number(data.receptionMethodId) : undefined,
    complaintTypeId: data.complaintTypeId ? Number(data.complaintTypeId) : undefined,
    respondentName: data.respondentName || undefined,
    departmentId: data.departmentId || undefined,
    annotation: data.annotation || undefined,
    presentationStatusId: data.presentationStatusId ? Number(data.presentationStatusId) : undefined,
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
