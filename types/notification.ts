export type NotificationType =
  | "NEW_ORDER"
  | "ORDER_STATUS"
  | "LOYALTY_REWARD"
  | "LOYALTY_REDEEMED";

export interface NotificationData {
  orderId?: string;
  tableId?: string;
  tableName?: string;
  total?: number;
  itemCount?: number;

  status?: string;

  customerId?: string;
  customerPhone?: string;

  rewardName?: string;
  rewardCount?: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;

  data: NotificationData;

  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: NotificationPagination;
}

export interface UnreadCountResponse {
  count: number;
}