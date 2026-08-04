export interface LoyaltyProgramRequest {
  rewardName: string;
  purchaseThreshold: number;
  rewardQuantity: number;
  minimumOrderValue: number;
  isActive: boolean;
}

export interface LoyaltyProgram {
  id: string;
  restaurantId: string;
  rewardName: string;
  purchaseThreshold: number;
  rewardQuantity: number;
  minimumOrderValue: number;
  isActive: boolean;
}

export interface LoyaltyCustomer {
  id: string;
  restaurantId: string;
  phone: string;
  name: string | null;
  visitCount: number;
  totalSpend: number;
  progressCount: number;
  lastOrderAt: string | null;
}

export interface LoyaltyReward {
  id: string;
  status: string;
  createdAt: string;
}

export interface LoyaltyProgress {
  purchaseThreshold: number;
  progressCount: number;
}

export interface LoyaltyCustomerProfile {
  customer: LoyaltyCustomer;
  rewards: LoyaltyReward[];
  progress: LoyaltyProgress;
}

/* -------------------- Loyalty Customers List -------------------- */

export interface LoyaltyCustomerListItem {
  id: string;
  phone: string;
  name: string | null;
  visitCount: number;
  progressCount: number;
  totalSpend: number;
  lastOrderAt: string | null;
  createdAt: string;
  availableRewards: number;
  redeemedRewards: number;
}

export interface LoyaltyCustomersResponse {
  data: LoyaltyCustomerListItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface LoyaltyCustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "lastOrderAt" | "visitCount" | "totalSpend" | "createdAt";
  order?: "asc" | "desc";
}