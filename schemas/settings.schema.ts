import { z } from "zod";

export const restaurantSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Restaurant name must be at least 2 characters.")
    .max(100, "Restaurant name is too long."),

  restaurantEmail: z
    .string()
    .trim()
    .email("Enter a valid restaurant email."),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long.")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(250, "Address is too long.")
    .optional()
    .or(z.literal("")),
});

export type RestaurantSettingsFormValues = z.infer<
  typeof restaurantSettingsSchema
>;