import api from "@/services/api";
import type {
  RestaurantTable,
  CreateTablePayload,
  UpdateTablePayload,
} from "@/types/table";
import type { ApiSuccessResponse } from "@/types/auth.types";

function unwrap<T>(response: { data: ApiSuccessResponse<T> | T }): T {
  const body = response.data;

  if (
    body &&
    typeof body === "object" &&
    "data" in body
  ) {
    return (body as ApiSuccessResponse<T>).data;
  }

  return body as T;
}

export async function getTables(): Promise<RestaurantTable[]> {
  const response = await api.get<ApiSuccessResponse<RestaurantTable[]> | RestaurantTable[]>(
    "/api/v1/tables",
  );

  const data = unwrap<RestaurantTable[]>(response);

  return Array.isArray(data)
    ? data.filter(
        (table): table is RestaurantTable =>
          Boolean(table?.id && table?.name),
      )
    : [];
}

export async function createTable(
  payload: CreateTablePayload,
): Promise<RestaurantTable> {
  const response = await api.post<ApiSuccessResponse<RestaurantTable> | RestaurantTable>(
    "/api/v1/tables",
    payload,
  );

  return unwrap<RestaurantTable>(response);
}

export async function updateTable(
  id: string,
  payload: UpdateTablePayload,
): Promise<RestaurantTable> {
  const response = await api.patch<ApiSuccessResponse<RestaurantTable> | RestaurantTable>(
    `/api/v1/tables/${id}`,
    payload,
  );

  return unwrap<RestaurantTable>(response);
}

export async function deleteTable(id: string): Promise<void> {
  await api.delete(`/api/v1/tables/${id}`);
}