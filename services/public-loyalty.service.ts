import api from "@/services/api";
import type { ApiSuccessResponse } from "@/types/auth.types";
import type {
  PublicLoyaltyCustomerProfile,
  LoyaltyProgram,
} from "@/types/loyalty";

export async function getPublicLoyaltyProgram(
  qrToken: string,
): Promise<LoyaltyProgram | null> {
  try {
    const response = await api.get<ApiSuccessResponse<LoyaltyProgram>>(
      `/api/v1/public/loyalty/program/${encodeURIComponent(qrToken)}`,
    );

    return {
      ...response.data.data,
      purchaseThreshold: Number(response.data.data.purchaseThreshold),
      rewardQuantity: Number(response.data.data.rewardQuantity),
      minimumOrderValue: Number(response.data.data.minimumOrderValue),
    };
 } catch (error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    error.response.status === 404
  ) {
    return null;
  }

  throw error;
}
}

export async function getPublicCustomerLoyaltyProfile(
  qrToken: string,
  phone: string,
): Promise<PublicLoyaltyCustomerProfile> {
  const response = await api.get<
    ApiSuccessResponse<PublicLoyaltyCustomerProfile>
  >(
    `/api/v1/public/loyalty/customer/${encodeURIComponent(
      qrToken,
    )}/${encodeURIComponent(phone)}`,
  );

  return response.data.data;
}