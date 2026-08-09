import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { socialApi } from "@/features/social/api";
import type {
  AddGroupPayload,
  SocialDraftStatus,
} from "@/features/social/types";

export const SOCIAL_QUERY_KEYS = {
  groups: ["social-groups"] as const,
  drafts: ["social-drafts"] as const,
};

export function useMonitoredGroups() {
  return useQuery({
    queryKey: SOCIAL_QUERY_KEYS.groups,
    queryFn: () => socialApi.listGroups(),
  });
}

export function useAddGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddGroupPayload) => socialApi.addGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.groups });
    },
  });
}

export function useToggleGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      socialApi.toggleGroup(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.groups });
    },
  });
}

export function useRemoveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => socialApi.removeGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.groups });
    },
  });
}

export function usePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => socialApi.poll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.drafts });
    },
  });
}

export function useSocialDrafts(status?: SocialDraftStatus) {
  return useQuery({
    queryKey: [...SOCIAL_QUERY_KEYS.drafts, status],
    queryFn: () => socialApi.listDrafts(status),
  });
}

export function useRejectDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      socialApi.rejectDraft(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.drafts });
    },
  });
}

export function useLinkDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, complaintId }: { id: string; complaintId: string }) =>
      socialApi.linkDraft(id, complaintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.drafts });
    },
  });
}
