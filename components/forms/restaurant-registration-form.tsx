"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  restaurantRegistrationSchema,
  type RestaurantRegistrationFormValues,
} from "@/schemas/auth.schema";
import { registerRestaurant } from "@/services/auth.service";

export function RestaurantRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RestaurantRegistrationFormValues>({
    resolver: zodResolver(restaurantRegistrationSchema),
    defaultValues: {
      restaurantName: "",
      restaurantEmail: "",
      restaurantPhone: "",
      address: "",
      ownerName: "",
      ownerEmail: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RestaurantRegistrationFormValues) => {
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const response = await registerRestaurant({
        restaurantName: values.restaurantName.trim(),
        restaurantEmail: values.restaurantEmail.trim(),
        restaurantPhone: values.restaurantPhone.trim(),
        address: values.address.trim(),
        ownerName: values.ownerName.trim(),
        ownerEmail: values.ownerEmail.trim(),
        password: values.password,
      });

     if (!response.accessToken || !response.refreshToken) {
  throw new Error(
    "Registration succeeded but authentication tokens were not returned."
  );
}

localStorage.setItem("accessToken", response.accessToken);
localStorage.setItem("refreshToken", response.refreshToken);

setIsSuccess(true);
      toast.success("Restaurant registered successfully. Opening dashboard...");

      window.setTimeout(() => {
        router.replace("/dashboard");
      }, 600);
    } catch (error) {
      console.error("Restaurant registration failed:", error);

      const responseData = axios.isAxiosError(error)
        ? error.response?.data
        : null;

      const message =
        responseData?.message ||
        responseData?.errors?.[0]?.message ||
        (error instanceof Error
          ? error.message
          : "Unable to register your restaurant right now. Please try again.");

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          Register your restaurant
        </h2>

        <p className="text-base text-stone-600">
          Create your CafeOS account and start managing your operations with a streamlined setup.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="restaurantName" className="text-sm font-medium text-stone-700">
              Restaurant Name
            </label>
            <input
              id="restaurantName"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none"
              {...register("restaurantName")}
            />
            {errors.restaurantName ? (
              <p className="text-sm text-red-600">{errors.restaurantName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="restaurantEmail" className="text-sm font-medium text-stone-700">
              Restaurant Email
            </label>
            <input
              id="restaurantEmail"
              type="email"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none"
              {...register("restaurantEmail")}
            />
            {errors.restaurantEmail ? (
              <p className="text-sm text-red-600">{errors.restaurantEmail.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="restaurantPhone" className="text-sm font-medium text-stone-700">
              Restaurant Phone
            </label>
            <input
              id="restaurantPhone"
              type="tel"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none"
              {...register("restaurantPhone")}
            />
            {errors.restaurantPhone ? (
              <p className="text-sm text-red-600">{errors.restaurantPhone.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-stone-700">
              Restaurant Address
            </label>
            <input
              id="address"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none"
              {...register("address")}
            />
            {errors.address ? (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="ownerName" className="text-sm font-medium text-stone-700">
              Owner Name
            </label>
            <input
              id="ownerName"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none"
              {...register("ownerName")}
            />
            {errors.ownerName ? (
              <p className="text-sm text-red-600">{errors.ownerName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="ownerEmail" className="text-sm font-medium text-stone-700">
              Owner Email
            </label>
            <input
              id="ownerEmail"
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none"
              {...register("ownerEmail")}
            />
            {errors.ownerEmail ? (
              <p className="text-sm text-red-600">{errors.ownerEmail.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 12 characters"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-stone-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            ) : null}
          </div>
        </div>

        <p className="rounded-xl bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600">
          Password must have at least 12 characters, including an uppercase letter,
          lowercase letter, number, and special character.
        </p>

        {isSuccess ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Registration successful. Opening dashboard…
          </div>
        ) : null}

        <Button
          type="submit"
          className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </div>
  );
}