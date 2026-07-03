import api from "@/services/api";
import type { RestaurantRegistrationPayload, RestaurantRegistrationResponse, LoginRequest, LoginResponse } from "@/types/auth";

export async function registerRestaurant(payload: RestaurantRegistrationPayload) {
  const response = await api.post<RestaurantRegistrationResponse>("/auth/register", payload);
  return response.data;
}

export async function loginOwner(payload: LoginRequest) {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
}
