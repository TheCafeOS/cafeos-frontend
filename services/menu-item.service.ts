import api from "@/services/api";

import type {
  CreateMenuItemPayload,
  MenuItem,
  MenuListResponse,
  MenuQueryParams,
  UpdateMenuItemPayload,
} from "@/types/menu-item";

type ApiResponse<T> = {
  success: boolean;
  message: string | null;
  data: T | null;
};

export async function getMenuItems(
  params: MenuQueryParams = {},
): Promise<{
  data: MenuItem[];
  pagination: MenuListResponse["pagination"];
}> {
  const response = await api.get<
    ApiResponse<MenuItem[]> & {
      pagination: MenuListResponse["pagination"];
    }
  >("/api/v1/menu", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search?.trim() || undefined,
      categoryId: params.categoryId || undefined,
      isAvailable: params.isAvailable,
      sort: params.sort,
      order: params.order,
    },
  });

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
  };
}

export async function createMenuItem(
  payload: CreateMenuItemPayload,
): Promise<MenuItem> {
  const response = await api.post<ApiResponse<MenuItem>>(
    "/api/v1/menu",
    payload,
  );

  if (!response.data.data) {
    throw new Error(
      response.data.message || "Server did not return the created menu item.",
    );
  }

  return response.data.data;
}

export async function updateMenuItem(
  id: string,
  payload: UpdateMenuItemPayload,
): Promise<MenuItem> {
  const response = await api.patch<ApiResponse<MenuItem>>(
    `/api/v1/menu/${id}`,
    payload,
  );

  if (!response.data.data) {
    throw new Error(
      response.data.message || "Server did not return the updated menu item.",
    );
  }

  return response.data.data;
}

export type DeleteMenuItemResult = {
  success: boolean;
  message: string;
};

export async function deleteMenuItem(
  id: string,
): Promise<DeleteMenuItemResult> {
  const response = await api.delete<ApiResponse<null>>(
    `/api/v1/menu/${id}`,
  );

  return {
    success: response.data.success,
    message:
      response.data.message ||
      "Menu item operation completed successfully.",
  };
}