export interface RestaurantSettings {
  id?: string;

  name: string;
  restaurantEmail: string;
  phone: string | null;
  address: string | null;

  logoUrl: string | null;
  coverImageUrl: string | null;

  tagline: string | null;
  description: string | null;
  cuisineType: string | null;

  website: string | null;
  instagram: string | null;
  facebook: string | null;
  customLink: string | null;

  themeColor: string | null;
}

export interface AccountSettings {
  name: string;
  email: string;
  role: string;
}

export interface SettingsResponse {
  restaurant: RestaurantSettings;
  account: AccountSettings | null;
}

export interface UpdateSettingsRequest {
  name: string;
  restaurantEmail: string;
  phone: string | null;
  address: string | null;

  tagline: string | null;
  description: string | null;
  cuisineType: string | null;

  website: string | null;
  instagram: string |null;
  facebook: string | null;
  customLink: string | null;
}