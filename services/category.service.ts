import api from "@/services/api";
import type {
  Category,
  CategoryListResponse,
  CategoryQueryParams,
} from "@/types/category";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getCategories(
  params: CategoryQueryParams = {},
): Promise<CategoryListResponse> {
  const response = await api.get<
    ApiResponse<Category[]> & {
      pagination: CategoryListResponse["pagination"];
    }
  >("/api/v1/categories", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,

      search: params.search?.trim() || undefined,

      sort: params.sort ?? "createdAt",
      order: params.order ?? "desc",
    },
  });

  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function createCategory(
  name: string,
): Promise<Category> {
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

export async function deleteCategory(
  id: string,
): Promise<void> {
  await api.delete(`/api/v1/categories/${id}`);
}