import api from "@/services/api";
import type {
  ApiSuccessResponse,
  LoginRequest,
  LoginResponse,
  RestaurantRegistrationData,
  RestaurantRegistrationPayload,
} from "@/types/auth.types";

export async function registerRestaurant(
  payload: RestaurantRegistrationPayload,
): Promise<RestaurantRegistrationData> {
  const response = await api.post<
    ApiSuccessResponse<RestaurantRegistrationData>
  >("/api/v1/auth/register", payload);

  return response.data.data;
}

export async function loginOwner(
  payload: LoginRequest,
): Promise<LoginResponse> {
  const response = await api.post<ApiSuccessResponse<LoginResponse>>(
    "/api/v1/auth/login",
    payload,
  );

  return response.data.data;
}