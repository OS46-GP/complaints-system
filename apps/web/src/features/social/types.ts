export type GroupType = "Group" | "Page";

export interface MonitoredGroup {
  id: string;
  groupId: string;
  name: string;
  type: GroupType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddGroupPayload {
  groupId: string;
  name: string;
  type: GroupType;
}

export type SocialDraftStatus = "Pending" | "Approved" | "Rejected";

export interface SocialDraftExtractedFields {
  subject: string;
  annotation: string;
  citizenFullName: string;
  citizenNationalId: string;
  citizenMobileNumber: string;
  citizenAddress: string;
  citizenVillage: string;
  citizenDistrict: string;
  complaintType: string;
  receptionMethod: string;
  severity: "Low" | "Medium" | "High";
}

export interface SocialDraft {
  id: string;
  sourcePostId: string;
  sourceLink: string;
  postText: string;
  authorName: string | null;
  postedAt: string;
  detectedAt: string;
  status: SocialDraftStatus;
  groupId: string | null;
  groupName: string | null;
  notes: string | null;
  extractedFields: SocialDraftExtractedFields | null;
  complaintId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PollResult {
  groupsPolled: number;
  postsFetched: number;
  spamSkipped: number;
  aiFiltered: number;
  duplicatesSkipped: number;
  draftsCreated: SocialDraft[];
}
