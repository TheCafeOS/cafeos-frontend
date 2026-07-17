export interface RestaurantSettings {
  name: string;
  restaurantEmail: string;
  phone: string | null;
  address: string | null;
}

export interface OwnerSettings {
  name: string;
  email: string;
  role: string;
}

export interface SettingsResponse {
  restaurant: RestaurantSettings;
  owner: OwnerSettings | null;
}

export interface UpdateSettingsRequest {
  name: string;
  restaurantEmail: string;
  phone: string | null;
  address: string | null;
}