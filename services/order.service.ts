import api from "@/services/api";

import type {
  GetOrdersParams,
  GetOrdersResponse,
  OrdersPagination,
  RestaurantOrder,
  UpdateOrderStatusPayload,
  UpdateOrderStatusResponse,
} from "@/types/order";

export async function getOrders(
  params: GetOrdersParams = {},
): Promise<{
  orders: RestaurantOrder[];
  pagination: OrdersPagination;
}> {
  const response = await api.get<GetOrdersResponse>("/api/v1/orders", {
    params,
  });

 return {
  orders: response.data.data,
  pagination: response.data.pagination,
};
}

export async function updateOrderStatus(
  orderId: string,
  payload: UpdateOrderStatusPayload,
): Promise<UpdateOrderStatusResponse["data"]> {
  const response = await api.patch<UpdateOrderStatusResponse>(
    `/api/v1/orders/${orderId}/status`,
    payload,
  );

  return response.data.data;
}