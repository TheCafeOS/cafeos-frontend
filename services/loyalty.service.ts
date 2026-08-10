import api from "@/services/api";
import type { ApiSuccessResponse } from "@/types/auth.types";

import type {
  LoyaltyCustomerProfile,
  LoyaltyCustomersQuery,
  LoyaltyCustomersResponse,
  LoyaltyProgram,
  LoyaltyProgramRequest,
} from "@/types/loyalty";

/* -------------------- API Response Types -------------------- */

interface LoyaltyCustomersApiResponse {
  success: boolean;
  message: string;
  data: LoyaltyCustomersResponse["data"];
  pagination: LoyaltyCustomersResponse["pagination"];
}

/* -------------------- Helpers -------------------- */

function normalizeProgram(
  program: LoyaltyProgram,
): LoyaltyProgram {
  return {
    ...program,
    purchaseThreshold: Number(
      program.purchaseThreshold,
    ),
    rewardQuantity: Number(
      program.rewardQuantity,
    ),
    minimumOrderValue: Number(
      program.minimumOrderValue,
    ),
    rewardCount:
      program.rewardCount !== undefined
        ? Number(program.rewardCount)
        : undefined,
    customerCount:
      program.customerCount !== undefined
        ? Number(program.customerCount)
        : undefined,
  };
}

/* -------------------- Loyalty Programs -------------------- */

export async function getLoyaltyPrograms(): Promise<
  LoyaltyProgram[]
> {
  const response = await api.get<
    ApiSuccessResponse<LoyaltyProgram[]>
  >("/api/v1/loyalty/programs");

  return response.data.data.map(normalizeProgram);
}

export async function createLoyaltyProgram(
  payload: LoyaltyProgramRequest,
): Promise<LoyaltyProgram> {
  const response = await api.post<
    ApiSuccessResponse<LoyaltyProgram>
  >("/api/v1/loyalty/programs", payload);

  return normalizeProgram(response.data.data);
}

export async function getLoyaltyProgram(
  programId: string,
): Promise<LoyaltyProgram> {
  const response = await api.get<
    ApiSuccessResponse<LoyaltyProgram>
  >(`/api/v1/loyalty/programs/${programId}`);

  return normalizeProgram(response.data.data);
}

export async function updateLoyaltyProgram(
  programId: string,
  payload: LoyaltyProgramRequest,
): Promise<LoyaltyProgram> {
  const response = await api.patch<
    ApiSuccessResponse<LoyaltyProgram>
  >(`/api/v1/loyalty/programs/${programId}`, payload);

  return normalizeProgram(response.data.data);
}

export async function updateLoyaltyProgramStatus(
  programId: string,
  isActive: boolean,
): Promise<LoyaltyProgram> {
  const response = await api.patch<
    ApiSuccessResponse<LoyaltyProgram>
  >(`/api/v1/loyalty/programs/${programId}/status`, {
    isActive,
  });

  return normalizeProgram(response.data.data);
}

export async function deleteLoyaltyProgram(
  programId: string,
): Promise<void> {
  await api.delete(
    `/api/v1/loyalty/programs/${programId}`,
  );
}

/* -------------------- Customer Profile -------------------- */

export async function getCustomerLoyaltyProfile(
  phone: string,
): Promise<LoyaltyCustomerProfile> {
  const response = await api.get<
    ApiSuccessResponse<LoyaltyCustomerProfile>
  >(
    `/api/v1/loyalty/customers/${encodeURIComponent(phone)}`,
  );

  const data = response.data.data;

  return {
    ...data,

    customer: {
      ...data.customer,
      totalSpend: Number(data.customer.totalSpend),
    },

    progress: data.progress.map((program) => ({
      ...program,
      progressCount: Number(
        program.progressCount,
      ),
      purchaseThreshold: Number(
        program.purchaseThreshold,
      ),
      rewardQuantity: Number(
        program.rewardQuantity,
      ),
    })),

    rewards: data.rewards.map((reward) => ({
      ...reward,
      programId: reward.programId ?? null,
    })),
  };
}

/* -------------------- Customers List -------------------- */

export async function getLoyaltyCustomers(
  params?: LoyaltyCustomersQuery,
): Promise<LoyaltyCustomersResponse> {
  const response =
    await api.get<LoyaltyCustomersApiResponse>(
      "/api/v1/loyalty/customers",
      {
        params,
      },
    );

  return {
    data: response.data.data.map((customer) => ({
      ...customer,

      totalSpend: Number(
        customer.totalSpend,
      ),

      programs: customer.programs.map(
        (program) => ({
          ...program,
          progressCount: Number(
            program.progressCount,
          ),
          purchaseThreshold: Number(
            program.purchaseThreshold,
          ),
        }),
      ),

      availableRewards: Number(
        customer.availableRewards,
      ),

      redeemedRewards: Number(
        customer.redeemedRewards,
      ),
    })),

    pagination:
      response.data.pagination,
  };
}

/* -------------------- Reward Redemption -------------------- */

export async function redeemReward(
  customerId: string,
  rewardId: string,
): Promise<void> {
  await api.post(
    `/api/v1/loyalty/customers/${customerId}/rewards/${rewardId}/redeem`,
  );
}