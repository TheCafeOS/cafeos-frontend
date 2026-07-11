"use client";

import { Lock, UserCircle2 } from "lucide-react";

import { InfoField } from "./info-field";

export function AccountCard() {
  return (
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
            Manage your owner account and security preferences.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <InfoField
          label="Owner Name"
          value="Not available yet"
        />

        <InfoField
          label="Owner Email"
          value="Not available yet"
        />

        <InfoField
          label="Role"
          value="Owner"
        />

        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div className="flex items-center gap-2 font-medium text-stone-800">
            <Lock className="h-4 w-4" />

            Change Password
          </div>

          <p className="mt-2 text-sm text-stone-500">
            Password management will be available once the backend endpoint is implemented.
          </p>
        </div>
      </div>
    </section>
  );
}