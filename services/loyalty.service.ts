import api from "@/services/api";

import type { ApiSuccessResponse } from "@/types/auth.types";

import type {
  LoyaltyCustomerProfile,
  LoyaltyProgram,
  LoyaltyProgramRequest,
} from "@/types/loyalty";

export async function getLoyaltyProgram(): Promise<LoyaltyProgram | null> {
  const response = await api.get<ApiSuccessResponse<LoyaltyProgram>>(
    "/api/v1/loyalty/program",
  );

  return response.data.data;
}

export async function updateLoyaltyProgram(
  payload: LoyaltyProgramRequest,
): 
Promise<LoyaltyProgram | null>
{
  const response = await api.put<ApiSuccessResponse<LoyaltyProgram>>(
    "/api/v1/loyalty/program",
    payload,
  );

return {
  ...response.data.data,
  purchaseThreshold: Number(response.data.data.purchaseThreshold),
  rewardQuantity: Number(response.data.data.rewardQuantity),
  minimumOrderValue: Number(response.data.data.minimumOrderValue),
};
}

export async function getCustomerLoyaltyProfile(
  phone: string,
): Promise<LoyaltyCustomerProfile> {
  const response = await api.get<ApiSuccessResponse<LoyaltyCustomerProfile>>(
    `/api/v1/loyalty/customers/${encodeURIComponent(phone)}`,
  );

  return response.data.data;
}

export async function redeemReward(
  customerId: string,
  rewardId: string,
): Promise<void> {
  await api.post(
    `/api/v1/loyalty/customers/${customerId}/rewards/${rewardId}/redeem`,
  );
}
