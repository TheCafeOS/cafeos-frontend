export type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "RESERVED"
  | "INACTIVE";

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  name: string;
  qrCode: string;
  status: TableStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTablePayload {
  name: string;
}

export interface UpdateTablePayload {
  name?: string;
  status?: TableStatus;
}