import { complaintsApi } from "@/features/complaint-list/api";

export interface ComplaintArchivePayload {
  archiveNumber: string;
  archiveDate?: string;
  archiveLocation?: string;
}

export async function submitComplaintArchive(
  complaintId: string,
  payload: ComplaintArchivePayload,
) {
  return complaintsApi.update(complaintId, payload);
}
