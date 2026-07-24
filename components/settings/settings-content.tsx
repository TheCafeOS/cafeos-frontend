"use client";

import { useEffect, useState } from "react";

import { AboutCard } from "./about-card";
import { AccountCard } from "./account-card";
import { RestaurantInformationCard } from "./restaurant-information-card";
import { SessionCard } from "./session-card";

import { getSettings } from "@/services/settings.service";
import type {
  RestaurantSettings,
  SettingsResponse,
} from "@/types/settings";

export function SettingsContent() {
  const [settings, setSettings] =
    useState<SettingsResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleRestaurantUpdated(
    restaurant: RestaurantSettings,
  ) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            restaurant,
          }
        : prev,
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-stone-200 bg-white py-16 shadow-sm">
        Loading settings...
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-red-200 bg-red-50 py-16 text-red-600 shadow-sm">
        Failed to load settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
<div className="grid items-start gap-6 xl:grid-cols-2">        <RestaurantInformationCard
         key={`${settings.restaurant.name}-${settings.restaurant.restaurantEmail}-${settings.restaurant.phone}-${settings.restaurant.address}`}
        restaurant={settings.restaurant}
         onUpdated={handleRestaurantUpdated}
/>

        <AccountCard account={settings.account} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SessionCard />
        <AboutCard />
      </div>
    </div>
  );
}