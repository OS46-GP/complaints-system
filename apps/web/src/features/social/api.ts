import { axiosClient } from "@/api/axios-client";
import type {
  AddGroupPayload,
  MonitoredGroup,
  PollResult,
  PollSummary,
  SocialDraft,
  SocialDraftStatus,
} from "@/features/social/types";

export const socialApi = {
  listGroups: () =>
    axiosClient.get<MonitoredGroup[]>("/api/social/groups").then((res) => res.data),
  addGroup: (payload: AddGroupPayload) =>
    axiosClient.post<MonitoredGroup>("/api/social/groups", payload).then((res) => res.data),
  toggleGroup: (id: string, isActive: boolean) =>
    axiosClient
      .post<MonitoredGroup>(`/api/social/groups/${id}/toggle`, { isActive })
      .then((res) => res.data),
  removeGroup: (id: string) =>
    axiosClient.post(`/api/social/groups/${id}/remove`).then((res) => res.data),
  poll: () =>
    axiosClient
      .post<PollResult>("/api/social/poll", null, { timeout: 180000 })
      .then((res) => res.data),
  summarizeByDate: (from?: string, to?: string) =>
    axiosClient
      .get<{ count: number; summary: PollSummary | null }>("/api/social/summary", {
        params: { from, to },
        timeout: 180000,
      })
      .then((res) => res.data),
  listDrafts: (status?: SocialDraftStatus) =>
    axiosClient
      .get<SocialDraft[]>("/api/social/drafts", { params: { status } })
      .then((res) => res.data),
  rejectDraft: (id: string, notes?: string) =>
    axiosClient
      .post(`/api/social/drafts/${id}/reject`, { notes })
      .then((res) => res.data),
  deleteDraft: (id: string) =>
    axiosClient.delete(`/api/social/drafts/${id}`).then((res) => res.data),
  linkDraft: (id: string, complaintId: string) =>
    axiosClient
      .post(`/api/social/drafts/${id}/link`, { complaintId })
      .then((res) => res.data),
};
