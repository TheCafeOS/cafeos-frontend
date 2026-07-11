"use client";

import { useRouter } from "next/navigation";
import { Lock, LogOut, Building2, UserCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="text-sm text-stone-900">{value}</p>
    </div>
  );
}

export function SettingsContent() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-stone-900">
                Restaurant Information
              </h2>
              <p className="text-sm text-stone-500">
                Update your restaurant profile once the backend endpoint is available.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <InfoField label="Restaurant Name" value="CafeOS Demo" />
            <InfoField label="Email" value="hello@cafeos.app" />
            <InfoField label="Phone" value="+1 (555) 010-2024" />
            <InfoField label="Address" value="123 Market Street, Downtown" />
          </div>

          <div className="mt-6">
            <Button disabled className="rounded-full bg-stone-300 text-stone-600">
              Save Changes
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-stone-900">
                Account
              </h2>
              <p className="text-sm text-stone-500">
                Manage owner account details and access controls.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <InfoField label="Owner Email" value="owner@cafeos.app" />
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                <Lock className="h-4 w-4" />
                Change Password
              </div>
              <p className="mt-2 text-sm text-stone-500">
                Password management will be available in a future update.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-stone-900">
                Session
              </h2>
              <p className="text-sm text-stone-500">
                Review the current sign-in state for this workspace.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm text-stone-600">
              You are currently signed in to the CafeOS dashboard. Logging out removes the stored session token and returns you to the login screen.
            </p>
            <Button onClick={handleLogout} className="rounded-full bg-stone-900 text-white hover:bg-stone-700">
              Logout
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-stone-900">
                About
              </h2>
              <p className="text-sm text-stone-500">
                Product details for the current CafeOS build.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <InfoField label="Product" value="CafeOS" />
            <InfoField label="Version" value="1.0.0 MVP" />
            <InfoField label="Development Environment" value="Next.js 16 • TypeScript • Tailwind CSS" />
          </div>
        </section>
      </div>
    </div>
  );
}
