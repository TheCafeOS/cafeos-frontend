"use client";

import { Info } from "lucide-react";

import { InfoField } from "./info-field";

export function AboutCard() {
  return (
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
            Information about the current CafeOS installation.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <InfoField
          label="Product"
          value="CafeOS"
        />

        <InfoField
          label="Version"
          value="1.0.0 MVP"
        />

        <InfoField
          label="Environment"
          value={process.env.NODE_ENV}
        />

        <InfoField
          label="Frontend"
          value="Next.js 16"
        />

        <InfoField
          label="Backend"
          value="Express + Prisma"
        />
      </div>
    </section>
  );
}