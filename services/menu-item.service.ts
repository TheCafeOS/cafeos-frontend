import api from "@/services/api";
import type {
  MenuItem,
  CreateMenuItemPayload,
  UpdateMenuItemPayload,
} from "@/types/menu-item";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getMenuItems(): Promise<MenuItem[]> {
  const response = await api.get<ApiResponse<MenuItem[]>>("/api/v1/menu");

  return Array.isArray(response.data.data) ? response.data.data : [];
}

export async function createMenuItem(
  payload: CreateMenuItemPayload
): Promise<MenuItem> {
  const response = await api.post<ApiResponse<MenuItem>>(
    "/api/v1/menu",
    payload
  );

  return response.data.data;
}

export async function updateMenuItem(
  id: string,
  payload: UpdateMenuItemPayload
): Promise<MenuItem> {
  const response = await api.patch<ApiResponse<MenuItem>>(
    `/api/v1/menu/${id}`,
    payload
  );

  return response.data.data;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await api.delete(`/api/v1/menu/${id}`);
}