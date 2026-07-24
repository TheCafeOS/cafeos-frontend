export type FoodType = "VEG" | "NON_VEG" | "EGG";

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

  // Image positioning
  imageScale: number;
  imagePositionX: number;
  imagePositionY: number;

  // Food type
  foodType: FoodType;

  // Availability
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

  // Image positioning
  imageScale?: number;
  imagePositionX?: number;
  imagePositionY?: number;

  // Food type
  foodType: FoodType;

  // Availability
  isAvailable?: boolean;
};

export type UpdateMenuItemPayload = CreateMenuItemPayload;

/* ---------- Pagination ---------- */

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface MenuListResponse {
  data: MenuItem[];
  pagination: Pagination;
}

/* ---------- Query Params ---------- */

export interface MenuQueryParams {
  page?: number;
  limit?: number;

  search?: string;

  categoryId?: string;

  isAvailable?: boolean;

  sort?: "name" | "price" | "createdAt";

  order?: "asc" | "desc";
}