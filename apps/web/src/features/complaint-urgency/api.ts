import { complaintsApi } from "@/features/complaint-list/api";

export interface UrgencyPayload {
  outgoingLetterNumber: string;
  outgoingLetterDate: string;
}

export async function sendUrgencyRequest(
  complaintId: string,
  departmentId: string,
  payload: UrgencyPayload,
) {
  return complaintsApi.sendUrgency(complaintId, departmentId, payload);
}