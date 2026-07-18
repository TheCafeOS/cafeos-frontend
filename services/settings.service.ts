import api from "@/services/api";

import type { ApiSuccessResponse } from "@/types/auth.types";

import type {
  SettingsResponse,
  UpdateSettingsRequest,
} from "@/types/settings";

export async function getSettings(): Promise<SettingsResponse> {
  const response =
    await api.get<ApiSuccessResponse<SettingsResponse>>(
      "/api/v1/settings",
    );

  return response.data.data;
}

export async function updateSettings(
  data: UpdateSettingsRequest,
): Promise<SettingsResponse> {
  const response =
    await api.patch<ApiSuccessResponse<SettingsResponse>>(
      "/api/v1/settings",
      data,
    );

  return response.data.data;
}

export async function uploadRestaurantLogo(
  file: File,
): Promise<SettingsResponse> {
  const formData = new FormData();

  formData.append("image", file);

  const response =
    await api.patch<ApiSuccessResponse<SettingsResponse>>(
      "/api/v1/settings/logo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

  return response.data.data;
}

export async function uploadRestaurantCover(
  file: File,
): Promise<SettingsResponse> {
  const formData = new FormData();

  formData.append("image", file);

  const response =
    await api.patch<ApiSuccessResponse<SettingsResponse>>(
      "/api/v1/settings/cover",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

  return response.data.data;
}