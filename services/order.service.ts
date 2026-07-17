import api from "@/services/api";

import type {
  GetOrdersParams,
  GetOrdersResponse,
  UpdateOrderStatusPayload,
  UpdateOrderStatusResponse,
} from "@/types/order";

export async function getOrders(
  params: GetOrdersParams = {},
): Promise<GetOrdersResponse["data"]> {
  const response = await api.get<GetOrdersResponse>("/api/v1/orders", {
    params,
  });

  return response.data.data;
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