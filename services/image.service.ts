import api from "@/services/api";
import type { MenuItem } from "@/types/menu-item";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function uploadMenuItemImage(
  menuItemId: string,
  file: File,
): Promise<MenuItem> {
  const formData = new FormData();

  formData.append("image", file);

  const response = await api.post<ApiResponse<MenuItem>>(
    `/api/v1/menu/${menuItemId}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
}