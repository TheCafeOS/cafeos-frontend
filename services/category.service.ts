import api from "@/services/api";
import type { Category } from "@/types/category";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<ApiResponse<Category[]>>(
    "/api/v1/categories",
  );

  return response.data.data;
}

export async function createCategory(name: string): Promise<Category> {
  const response = await api.post<ApiResponse<Category>>(
    "/api/v1/categories",
    {
      name,
    },
  );

  return response.data.data;
}

export async function updateCategory(
  id: string,
  name: string,
): Promise<Category> {
  const response = await api.patch<ApiResponse<Category>>(
    `/api/v1/categories/${id}`,
    {
      name,
    },
  );

  return response.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/api/v1/categories/${id}`);
}