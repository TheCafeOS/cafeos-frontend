export type RestaurantRegistrationPayload = {
  restaurantName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  country: string;
};

export type RestaurantRegistrationResponse = {
  message: string;
  restaurantId?: string;
};
