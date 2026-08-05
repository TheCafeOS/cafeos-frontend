import api from "@/services/api";

import type { ApiSuccessResponse } from "@/types/auth.types";

import type {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
} from "@/types/notification";

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
}): Promise<NotificationsResponse> {
  const response = await api.get("/api/v1/notifications", {
    params,
  });

  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function getUnreadCount(): Promise<number> {
  const response = await api.get<
    ApiSuccessResponse<UnreadCountResponse>
  >("/api/v1/notifications/unread-count");

  return response.data.data.unreadCount;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<Notification> {
  const response = await api.patch<
    ApiSuccessResponse<Notification>
  >(`/api/v1/notifications/${notificationId}/read`);

  return response.data.data;
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch("/api/v1/notifications/read-all");
}

export async function deleteNotification(
  notificationId: string,
): Promise<void> {
  await api.delete(`/api/v1/notifications/${notificationId}`);
}