export type RestaurantRegistrationPayload = {
  restaurantName: string;
  restaurantEmail: string;
  restaurantPhone: string;
  address: string;
  ownerName: string;
  ownerEmail: string;
  password: string;
};

export type RestaurantRegistrationResponse = {
  success: boolean;
  message: string;
  data?: {
    token: string;
    employee: {
      id: string;
      restaurantId: string;
      email: string;
      role: string;
    };
    restaurant: {
      id: string;
      name: string;
      slug: string;
      restaurantEmail: string;
      phone: string;
      address: string;
    };
  };
};
