export type RestaurantTable = {
  id: string;
  restaurantId: string;
  name: string;
  qrCode: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
};

export type CreateTablePayload = {
  name: string;
};

export type UpdateTablePayload = {
  name: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "INACTIVE";
};
