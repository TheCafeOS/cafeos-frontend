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
