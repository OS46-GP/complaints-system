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
  complaintId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PollResult {
  groupsPolled: number;
  postsFetched: number;
  spamSkipped: number;
  duplicatesSkipped: number;
  draftsCreated: SocialDraft[];
}
