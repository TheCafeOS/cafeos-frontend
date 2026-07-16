import api from "@/services/api";

export async function uploadMenuItemImage(
  menuItemId: string,
  file: File,
) {
  const formData = new FormData();

  formData.append("image", file);

  const response = await api.post(
    `/api/v1/menu/${menuItemId}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}