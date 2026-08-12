import { complaintsApi } from "@/features/complaint-list/api";

export interface ReassignComplaintPayload {
  outgoingLetterNumber: string;
  outgoingLetterDate: string;
  responseDeadlineDays: number;
}

export async function reassignComplaintToDepartment(
  complaintId: string,
  departmentId: string,
  payload: ReassignComplaintPayload,
) {
  return complaintsApi.reassignComplaint(complaintId, departmentId, payload);
}