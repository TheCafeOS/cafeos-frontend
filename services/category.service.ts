import api from "@/services/api";
import type { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/api/v1/categories");

  return Array.isArray(response.data) ? response.data : [];
}

export async function createCategory(name: string): Promise<Category> {
  const response = await api.post<Category>("/api/v1/categories", {
    name,
  });

  const category = response.data;

  if (!category?.id || !category?.name) {
    console.error("Unexpected create-category response:", category);
    throw new Error("Server did not return a valid category.");
  }

  return category;
}

export async function updateCategory(
  id: string,
  name: string,
): Promise<Category> {
  const response = await api.patch<Category>(`/api/v1/categories/${id}`, {
    name,
  });

  const category = response.data;

  if (!category?.id || !category?.name) {
    console.error("Unexpected update-category response:", category);
    throw new Error("Server did not return a valid category.");
  }

  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/api/v1/categories/${id}`);
}