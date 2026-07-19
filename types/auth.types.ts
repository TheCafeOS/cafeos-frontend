export type RestaurantRegistrationPayload = {
  restaurantName: string;
  restaurantEmail: string;
  restaurantPhone: string;
  address: string;
  ownerName: string;
  ownerEmail: string;
  password: string;
};

export type RestaurantRegistrationData = {
  accessToken: string;
  refreshToken: string;

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
    phone: string | null;
    address: string |null;
  };
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;

  employee: {
    id: string;
    restaurantId: string;
    email: string;
    role: string;
  };
};

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};