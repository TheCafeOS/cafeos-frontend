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
  createdAt: string;
  updatedAt: string;

  // Returned by GET /loyalty/programs
  rewardCount?: number;
  customerCount?: number;
}

/* -------------------- Customer -------------------- */

export interface LoyaltyCustomer {
  id: string;
  restaurantId: string;
  phone: string;
  name: string | null;
  visitCount: number;
  totalSpend: number;
  lastOrderAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

/* -------------------- Customer Program Progress -------------------- */

export interface LoyaltyCustomerProgramProgress {
  programId: string;
  rewardName: string;
  progressCount: number;
  purchaseThreshold: number;
  rewardQuantity: number;
  isActive: boolean;
}

/* -------------------- Rewards -------------------- */

export interface LoyaltyReward {
  id: string;
  programId: string | null;
  status: "AVAILABLE" | "REDEEMED";
  createdAt: string;
  redeemedAt?: string | null;
  orderId?: string | null;
}

/* -------------------- Customer Profile -------------------- */

export interface LoyaltyCustomerProfile {
  customer: LoyaltyCustomer;
  progress: LoyaltyCustomerProgramProgress[];
  rewards: LoyaltyReward[];
}

/* -------------------- Public Loyalty -------------------- */

export interface PublicLoyaltyCustomer {
  phone: string;
  visitCount: number;
}

export interface PublicLoyaltyProgramProgress {
  programId: string;
  rewardName: string;
  progressCount: number;
  purchaseThreshold: number;
  rewardQuantity: number;
  isActive: boolean;
}

export interface PublicLoyaltyCustomerProfile {
  customer: PublicLoyaltyCustomer;
  programs: PublicLoyaltyProgramProgress[];
  rewards: LoyaltyReward[];
}

/* -------------------- Loyalty Customers List -------------------- */

export interface LoyaltyCustomerProgram {
  programId: string;
  progressCount: number;
  purchaseThreshold: number;
}

export interface LoyaltyCustomerListItem {
  id: string;
  phone: string;
  name: string | null;
  visitCount: number;
  totalSpend: number;
  lastOrderAt: string | null;
  createdAt: string;

  programs: LoyaltyCustomerProgram[];

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