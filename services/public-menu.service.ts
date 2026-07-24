import api from "@/services/api";

export interface MenuItemResponse {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  imageUrl: string | null;

  isAvailable?: boolean;

  foodType: "VEG" | "NON_VEG" | "EGG";

  categoryId: string | null;
  category: {
    id: string;
    name: string;
  } | null;
}

export interface CategoryResponse {
  id: string;
  name: string;
}

export interface TableResponse {
  id: string;
  name: string;
  status: string;
}

export interface RestaurantResponse {
  id: string;
  name: string;
  slug: string;

  logoUrl: string | null;
  coverImageUrl: string | null;

  tagline: string | null;
  cuisineType: string | null;

  themeColor: string | null;
}

export interface PublicMenuResponse {
  table: TableResponse;
  restaurant: RestaurantResponse;
  categories: CategoryResponse[];
  menuItems: MenuItemResponse[];
}

interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchPublicMenu(
  qrToken: string,
): Promise<PublicMenuResponse> {
  const response = await api.get<ApiSuccessResponse<PublicMenuResponse>>(
    `/api/v1/public/menu/${qrToken}`,
  );

  return response.data.data;
}