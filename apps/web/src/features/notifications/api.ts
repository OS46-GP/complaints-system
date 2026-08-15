import { axiosClient } from "@/api/axios-client";

export interface NotificationItem {
  id: string;
  recipientId: string | null;
  recipientRole: string | null;
  actorId: string | null;
  type: string;
  title: string;
  body: string;
  resourceId: string | null;
  readAt: string | null;
  createdAt: string;
}

export const notificationsApi = {
  list: () =>
    axiosClient
      .get<NotificationItem[]>("/api/notifications")
      .then((res) => res.data),
  unreadCount: () =>
    axiosClient
      .get<{ count: number }>("/api/notifications/unread-count")
      .then((res) => res.data),
  markRead: (id: string) =>
    axiosClient
      .patch(`/api/notifications/${id}/read`)
      .then((res) => res.data),
};
