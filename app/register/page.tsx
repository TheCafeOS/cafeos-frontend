import { RestaurantRegistrationForm } from "@/components/forms/restaurant-registration-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-700">
            Restaurant registration
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            Launch your café operations with CafeOS.
          </h1>
          <p className="text-lg leading-8 text-stone-600">
            Create your restaurant profile and get started with a calmer, more connected service experience.
          </p>
        </div>
        <RestaurantRegistrationForm />
      </div>
    </main>
  );
}
