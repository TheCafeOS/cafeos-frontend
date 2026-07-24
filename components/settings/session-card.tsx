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
            Manage your login session.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 sm:p-4">
<div className="flex items-center justify-between gap-3">    
  
        <span className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            ● Active
          </span>

          <Button
            onClick={handleLogout}
            variant="ghost"
className="h-9 px-3 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </section>
  );
}