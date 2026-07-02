import api from "@/services/api";
import type { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories");
  return response.data;
}

export async function createCategory(name: string): Promise<Category> {
  const response = await api.post<Category>("/categories", { name });
  return response.data;
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const response = await api.put<Category>(`/categories/${id}`, { name });
  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
