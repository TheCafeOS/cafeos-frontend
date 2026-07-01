import { z } from "zod";

export const restaurantRegistrationSchema = z
  .object({
    restaurantName: z.string().min(2, "Restaurant name is required"),
    ownerName: z.string().min(2, "Owner name is required"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(7, "Enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    city: z.string().min(2, "City is required"),
    country: z.string().min(2, "Country is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RestaurantRegistrationFormValues = z.infer<typeof restaurantRegistrationSchema>;
