import { complaintsApi } from "@/features/complaint-list/api";

export interface ComplaintResponsePayload {
  authorityResponseText: string;
  authorityResponseDate?: string;
  incomingResponseNumber?: string;
  examinationStatusId?: number;
  examinationResult?: string;
}

export async function submitComplaintResponse(
  complaintId: string,
  payload: ComplaintResponsePayload,
) {
  return complaintsApi.update(complaintId, payload);
}
