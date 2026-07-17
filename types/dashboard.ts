import type { OrderStatus } from "@/types/order";

export interface DashboardToday {
  totalOrders: number;
  totalRevenue: number;
  date: string;
}

export interface DashboardStatusCount {
  status: OrderStatus;
  count: number;
}

export interface DashboardRecentOrder {
  id: string;
  tableName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export interface DashboardSummary {
  today: DashboardToday;
  statusBreakdown: DashboardStatusCount[];
  recentOrders: DashboardRecentOrder[];
}

export interface DashboardSummaryResponse {
  success: boolean;
  message: string;
  data: DashboardSummary;
}