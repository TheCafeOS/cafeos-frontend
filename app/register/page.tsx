import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantRegistrationForm } from "@/components/forms/restaurant-registration-form";

const isDevelopment = process.env.NODE_ENV === "development";

export default function RegisterPage() {
  if (isDevelopment) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-700">
              Restaurant Registration
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              Launch your café operations with CafeOS.
            </h1>

            <p className="text-lg leading-8 text-stone-600">
              Create your restaurant profile and start managing orders, tables,
              menus, and inventory from one platform.
            </p>
          </div>

          <RestaurantRegistrationForm />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Lock className="h-8 w-8" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-700">
          Invitation Only
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950">
          Restaurant registration is currently by invitation.
        </h1>

        <p className="mt-6 text-lg leading-8 text-stone-600">
          CafeOS currently onboards restaurants through our team to ensure a
          smooth setup. If you&apos;d like to use CafeOS for your restaurant,
          contact us and we&apos;ll help you get started.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-amber-600 text-white hover:bg-amber-700"
          >
            <Link href="mailto:cafeos.app@gmail.com">
              Contact Team
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full"
          >
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>

        <div className="mt-10 rounded-2xl border border-stone-200 bg-stone-50 p-6 text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-900">
            How onboarding works
          </h2>

          <ol className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
            <li>1. Contact the CafeOS team.</li>
            <li>2. We onboard and configure your restaurant.</li>
            <li>3. We create your account.</li>
            <li>4. You receive your login credentials.</li>
            <li>5. Start managing your restaurant with CafeOS.</li>
          </ol>
        </div>
      </div>
    </main>
  );
}