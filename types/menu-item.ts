export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateMenuItemPayload = {
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  imageUrl?: string;
  isAvailable?: boolean;
};

export type UpdateMenuItemPayload = CreateMenuItemPayload;
