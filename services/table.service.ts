import api from "@/services/api";
import type { RestaurantTable, CreateTablePayload, UpdateTablePayload } from "@/types/table";

export async function getTables(): Promise<RestaurantTable[]> {
  const response = await api.get<RestaurantTable[]>("/tables");
  return response.data;
}

export async function createTable(payload: CreateTablePayload): Promise<RestaurantTable> {
  const response = await api.post<RestaurantTable>("/tables", payload);
  return response.data;
}

export async function updateTable(id: string, payload: UpdateTablePayload): Promise<RestaurantTable> {
  const response = await api.put<RestaurantTable>(`/tables/${id}`, payload);
  return response.data;
}

export async function deleteTable(id: string): Promise<void> {
  await api.delete(`/tables/${id}`);
}
