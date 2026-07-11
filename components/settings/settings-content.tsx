"use client";

import { AboutCard } from "./about-card";
import { AccountCard } from "./account-card";
import { RestaurantInformationCard } from "./restaurant-information-card";
import { SessionCard } from "./session-card";

export function SettingsContent() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <RestaurantInformationCard />
        <AccountCard />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SessionCard />
        <AboutCard />
      </div>
    </div>
  );
}