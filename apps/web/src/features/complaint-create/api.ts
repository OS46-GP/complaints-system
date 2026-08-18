import { complaintsApi, type CreateComplaintPayload } from "@/features/complaint-list/api";
import type { ComplaintCreateFormData } from "@/features/complaint-create/types";

export async function createComplaint(data: ComplaintCreateFormData) {
  const departments = data.departments
    .filter((department) => department.departmentId.trim())
    .map((department) => ({
      departmentId: department.departmentId,
      outgoingLetterNumber: department.outgoingLetterNumber.trim(),
      outgoingLetterDate: department.outgoingLetterDate,
      responseDeadlineDays: department.responseDeadlineDays
        ? Number(department.responseDeadlineDays)
        : undefined,
    }));

  const payload: CreateComplaintPayload = {
    statementYear: new Date().getFullYear(),
    arrivalDate: new Date().toISOString(),
    subject: data.subject,
    severity: data.severity,
    receptionMethodId: data.receptionMethodId ? Number(data.receptionMethodId) : undefined,
    complaintTypeId: data.complaintTypeId ? Number(data.complaintTypeId) : undefined,
    departments,
    annotation: data.annotation || undefined,
    citizen: {
      fullName: data.citizen.fullName,
      nationalId: data.citizen.nationalId || undefined,
      mobileNumber: data.citizen.mobileNumber || undefined,
      address: data.citizen.address || undefined,
      village: data.citizen.village || undefined,
      district: data.citizen.district || undefined,
    },
  };

  return complaintsApi.create(payload);
}