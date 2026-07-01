import api from "@/services/api";
import type { RestaurantRegistrationPayload, RestaurantRegistrationResponse } from "@/types/auth";

export async function registerRestaurant(payload: RestaurantRegistrationPayload) {
  const response = await api.post<RestaurantRegistrationResponse>("/auth/register", payload);
  return response.data;
}
