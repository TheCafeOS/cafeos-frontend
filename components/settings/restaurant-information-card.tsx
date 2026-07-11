"use client";

import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { updateSettings } from "@/services/settings.service";

import type {
  RestaurantSettings,
  UpdateSettingsRequest,
} from "@/types/settings";

type RestaurantInformationCardProps = {
  restaurant: RestaurantSettings;
  onUpdated: (restaurant: RestaurantSettings) => void;
};

export function RestaurantInformationCard({
  restaurant,
  onUpdated,
}: RestaurantInformationCardProps) {
 const [form, setForm] = useState<UpdateSettingsRequest>(() => ({
  name: restaurant.name,
  restaurantEmail: restaurant.restaurantEmail,
  phone: restaurant.phone,
  address: restaurant.address,
}));

  const [saving, setSaving] = useState(false);


  const hasChanges = useMemo(() => {
    return (
      form.name !== restaurant.name ||
      form.restaurantEmail !== restaurant.restaurantEmail ||
      form.phone !== restaurant.phone ||
      form.address !== restaurant.address
    );
  }, [form, restaurant]);

  async function handleSave() {
  try {
    setSaving(true);

    const updated = await updateSettings(form);

    const updatedRestaurant = updated.restaurant;

    setForm({
      name: updatedRestaurant.name,
      restaurantEmail: updatedRestaurant.restaurantEmail,
      phone: updatedRestaurant.phone,
      address: updatedRestaurant.address,
    });

    onUpdated(updatedRestaurant);

    alert("Settings updated successfully.");
  } catch (error) {
    console.error(error);
    alert("Failed to update settings.");
  } finally {
    setSaving(false);
  }
}

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Building2 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">
            Restaurant Information
          </h2>

          <p className="text-sm text-stone-500">
            Update your restaurant details.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <Label>Restaurant Name</Label>

          <Input
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label>Restaurant Email</Label>

          <Input
            type="email"
            value={form.restaurantEmail}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                restaurantEmail: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label>Phone</Label>

          <Input
            value={form.phone ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                phone: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label>Address</Label>

          <Textarea
            rows={4}
            value={form.address ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                address: e.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        {hasChanges && (
          <p className="mt-2 text-xs text-amber-600">
            You have unsaved changes.
          </p>
        )}
      </div>
    </section>
  );
}