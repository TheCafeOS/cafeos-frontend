"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { loginOwner } from "@/services/auth.service";

import { connectSocket } from "@/lib/socket";

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await loginOwner({
        email: values.email,
        password: values.password,
      });

localStorage.setItem("token", response.accessToken);

connectSocket();
      const redirectTo = searchParams.get("redirect");

      toast.success("Login successful. Redirecting to dashboard...");

      router.replace(
        redirectTo && redirectTo.startsWith("/dashboard")
          ? redirectTo
          : "/dashboard",
      );
    } catch (error) {
      console.error(error);

      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Unable to sign in. Please try again.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          Welcome back
        </h2>

        <p className="text-base text-stone-600">
          Sign in to your CafeOS account to access your operations dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-stone-700"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-0"
            {...register("email")}
          />

          {errors.email ? (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-stone-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-0"
            {...register("password")}
          />

          {errors.password ? (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </div>
  );
}