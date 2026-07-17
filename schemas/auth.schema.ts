import { z } from "zod";

export const restaurantRegistrationSchema = z
  .object({
    restaurantName: z.string().min(2, "Restaurant name is required"),
    restaurantEmail: z.string().email("Enter a valid restaurant email address"),
    restaurantPhone: z.string().min(7, "Enter a valid restaurant phone number"),
    address: z.string().min(5, "Address is required"),
    ownerName: z.string().min(2, "Owner name is required"),
    ownerEmail: z.string().email("Enter a valid owner email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RestaurantRegistrationFormValues = z.infer<typeof restaurantRegistrationSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
