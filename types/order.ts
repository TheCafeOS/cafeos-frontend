export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderSortField = "createdAt" | "status" | "total";
export type SortOrder = "asc" | "desc";

export interface OrderMenuItem {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: OrderMenuItem;
}

export interface RestaurantOrder {
  id: string;
  status: OrderStatus;
  customerPhone: string | null;
  total: number;
  createdAt: string;
  updatedAt: string;
  table: {
    id: string;
    name: string;
  };
  items: OrderItem[];
}

export interface OrdersPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  tableId?: string;
  from?: string;
  to?: string;
  sort?: OrderSortField;
  order?: SortOrder;
}

export interface GetOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: RestaurantOrder[];
    pagination: OrdersPagination;
  };
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  message: string;
  data: RestaurantOrder;
}