"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { clearAuth } from "@/utils/auth";
import { Button } from "@/components/ui/button";

export function SessionCard() {
  const router = useRouter();

  const handleLogout = () => {
  clearAuth();
  router.push("/login");
};

  return (
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
            Manage your current login session.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-stone-600">
              Session Status
            </p>

            <p className="text-sm text-emerald-600">
              Active
            </p>
          </div>

          <p className="text-sm text-stone-500">
            Logging out removes the current access token and returns you to the login screen.
          </p>

          <Button
            onClick={handleLogout}
            variant="destructive"
          >
            Logout
          </Button>
        </div>
      </div>
    </section>
  );
}