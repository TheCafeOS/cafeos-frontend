import api from "@/services/api";

import type { ApiSuccessResponse } from "@/types/auth.types";
import type { LoyaltyCustomerProfile, LoyaltyProgram } from "@/types/loyalty";

export async function getPublicLoyaltyProgram(
  qrToken: string,
): Promise<LoyaltyProgram | null> {
  const response = await api.get<ApiSuccessResponse<LoyaltyProgram>>(
    `/api/v1/public/loyalty/program/${encodeURIComponent(qrToken)}`,
  );

  return {
    ...response.data.data,
    purchaseThreshold: Number(response.data.data.purchaseThreshold),
    rewardQuantity: Number(response.data.data.rewardQuantity),
    minimumOrderValue: Number(response.data.data.minimumOrderValue),
  };
}

export async function getPublicCustomerLoyaltyProfile(
  qrToken: string,
  phone: string,
): Promise<LoyaltyCustomerProfile> {
  const response = await api.get<ApiSuccessResponse<LoyaltyCustomerProfile>>(
    `/api/v1/public/loyalty/customer/${encodeURIComponent(
      qrToken,
    )}/${encodeURIComponent(phone)}`,
  );

  return response.data.data;
}
