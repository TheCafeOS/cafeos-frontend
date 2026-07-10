import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm text-stone-600">Loading sign in...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-700">
            Owner login
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            Access your CafeOS dashboard.
          </h1>

          <p className="text-lg leading-8 text-stone-600">
            Sign in with your account to manage orders, inventory, and
            operations.
          </p>
        </div>

        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}