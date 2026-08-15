import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationsApi } from "@/features/notifications/api";
import { usersApi } from "@/features/users/api";

const KEYS = {
  list: ["notifications", "list"],
  unread: ["notifications", "unread"],
};

export function useNotifications() {
  return useQuery({
    queryKey: KEYS.list,
    queryFn: notificationsApi.list,
    refetchInterval: 30_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: KEYS.unread,
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 20_000,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.list });
      queryClient.invalidateQueries({ queryKey: KEYS.unread });
    },
  });
}

export function useApprovePasswordReset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => usersApi.approvePasswordReset(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.list });
      queryClient.invalidateQueries({ queryKey: KEYS.unread });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useRejectPasswordReset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => usersApi.rejectPasswordReset(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.list });
      queryClient.invalidateQueries({ queryKey: KEYS.unread });
    },
  });
}
