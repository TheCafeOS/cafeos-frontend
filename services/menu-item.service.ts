import api from "@/services/api";
import type { MenuItem, CreateMenuItemPayload, UpdateMenuItemPayload } from "@/types/menu-item";

export async function getMenuItems(): Promise<MenuItem[]> {
  const response = await api.get<MenuItem[]>("/menu");
  return response.data;
}

export async function createMenuItem(payload: CreateMenuItemPayload): Promise<MenuItem> {
  const response = await api.post<MenuItem>("/menu", payload);
  return response.data;
}

export async function updateMenuItem(id: string, payload: UpdateMenuItemPayload): Promise<MenuItem> {
  const response = await api.put<MenuItem>(`/menu/${id}`, payload);
  return response.data;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await api.delete(`/menu/${id}`);
}
