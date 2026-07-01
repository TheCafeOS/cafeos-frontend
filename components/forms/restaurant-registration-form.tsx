"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RestaurantRegistrationFormValues>({
    resolver: zodResolver(restaurantRegistrationSchema),
    defaultValues: {
      restaurantName: "",
      ownerName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      city: "",
      country: "",
    },
  });

  const onSubmit = async (values: RestaurantRegistrationFormValues) => {
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      await registerRestaurant({
        restaurantName: values.restaurantName,
        ownerName: values.ownerName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        city: values.city,
        country: values.country,
      });

      setIsSuccess(true);
      reset();
      toast.success("Restaurant registration request submitted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to register your restaurant right now. Please try again.");
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
              Restaurant name
            </label>
            <input id="restaurantName" className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-0" {...register("restaurantName")} />
            {errors.restaurantName ? (
              <p className="text-sm text-red-600">{errors.restaurantName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="ownerName" className="text-sm font-medium text-stone-700">
              Owner name
            </label>
            <input id="ownerName" className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-0" {...register("ownerName")} />
            {errors.ownerName ? <p className="text-sm text-red-600">{errors.ownerName.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-stone-700">
              Email
            </label>
            <input id="email" type="email" className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-0" {...register("email")} />
            {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-stone-700">
              Phone
            </label>
            <input id="phone" className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-0" {...register("phone")} />
            {errors.phone ? <p className="text-sm text-red-600">{errors.phone.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-stone-700">
              Password
            </label>
            <input id="password" type="password" className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-0" {...register("password")} />
            {errors.password ? <p className="text-sm text-red-600">{errors.password.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-stone-700">
              Confirm password
            </label>
            <input id="confirmPassword" type="password" className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-0" {...register("confirmPassword")} />
            {errors.confirmPassword ? (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium text-stone-700">
              City
            </label>
            <input id="city" className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-0" {...register("city")} />
            {errors.city ? <p className="text-sm text-red-600">{errors.city.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium text-stone-700">
              Country
            </label>
            <input id="country" className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-0" {...register("country")} />
            {errors.country ? <p className="text-sm text-red-600">{errors.country.message}</p> : null}
          </div>
        </div>

        {isSuccess ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Registration request received. We will be in touch soon.
          </div>
        ) : null}

        <Button type="submit" className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700" disabled={isSubmitting}>
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
