"use client";

import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoField } from "./info-field";

export function RestaurantInformationCard() {
  return (
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
            Restaurant details will become editable once backend support is available.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <InfoField
          label="Restaurant Name"
          value="Not available yet"
        />

        <InfoField
          label="Restaurant Email"
          value="Not available yet"
        />

        <InfoField
          label="Phone"
          value="Not available yet"
        />

        <InfoField
          label="Address"
          value="Not available yet"
        />
      </div>

      <div className="mt-6">
        <Button disabled>
          Save Changes
        </Button>

        <p className="mt-2 text-xs text-stone-500">
          Save functionality will be enabled after the Settings API is available.
        </p>
      </div>
    </section>
  );
}