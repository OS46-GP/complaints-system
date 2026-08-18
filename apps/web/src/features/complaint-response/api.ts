import { complaintsApi } from "@/features/complaint-list/api";

export interface ComplaintResponsePayload {
  responseText: string;
  responseDate: string;
  responseNumber: string;
  importDate?: string;
  examinationStatusId?: number;
  examinationResult?: string;
  outgoingLetterNumber?: string;
  outgoingLetterDate?: string;
  responseDeadlineDays?: number;
}

export async function submitDepartmentResponse(
  complaintId: string,
  departmentId: string,
  payload: ComplaintResponsePayload,
) {
  return complaintsApi.submitDepartmentResponse(complaintId, departmentId, payload);
}