import api from "@/services/api";

export interface MenuItemResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string | null;
  category: { id: string; name: string } | null;
}

export interface CategoryResponse {
  id: string;
  name: string;
}

export interface TableResponse {
  id: string;
  name: string;
  status: string;
  restaurantId: string;
}

export interface RestaurantResponse {
  id: string;
  name: string;
  slug: string;
}

export interface PublicMenuResponse {
  table: TableResponse;
  restaurant: RestaurantResponse;
  categories: CategoryResponse[];
  menuItems: MenuItemResponse[];
}

export async function fetchPublicMenu(
  qrToken: string,
): Promise<PublicMenuResponse> {
  const response = await api.get<PublicMenuResponse>(
    `/api/v1/public/menu/${qrToken}`,
  );

  return response.data;
}