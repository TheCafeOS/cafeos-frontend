"use client";

import Image from "next/image";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import {
  Building2,
  Camera,
  ImageIcon,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  updateSettings,
  uploadRestaurantCover,
  uploadRestaurantLogo,
} from "@/services/settings.service";

import type {
  RestaurantSettings,
  UpdateSettingsRequest,
} from "@/types/settings";

import {
  DAY_KEYS,
  type DayKey,
  type OpeningHours,
} from "@/types/opening-hours";

const DAY_LABELS: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function createDefaultOpeningHours(): OpeningHours {
  return {
    monday: {
      isOpen: false,
      open: null,
      close: null,
    },
    tuesday: {
      isOpen: false,
      open: null,
      close: null,
    },
    wednesday: {
      isOpen: false,
      open: null,
      close: null,
    },
    thursday: {
      isOpen: false,
      open: null,
      close: null,
    },
    friday: {
      isOpen: false,
      open: null,
      close: null,
    },
    saturday: {
      isOpen: false,
      open: null,
      close: null,
    },
    sunday: {
      isOpen: false,
      open: null,
      close: null,
    },
  };
}

function cloneOpeningHours(
  openingHours: OpeningHours | null,
): OpeningHours | null {
  if (!openingHours) {
    return null;
  }

  return DAY_KEYS.reduce((result, day) => {
    result[day] = {
      isOpen: openingHours[day]?.isOpen ?? false,
      open: openingHours[day]?.open ?? null,
      close: openingHours[day]?.close ?? null,
    };

    return result;
  }, {} as OpeningHours);
}

type RestaurantInformationCardProps = {
  restaurant: RestaurantSettings;
  onUpdated: (restaurant: RestaurantSettings) => void;
};

export function RestaurantInformationCard({
  restaurant,
  onUpdated,
}: RestaurantInformationCardProps) {
const [form, setForm] = useState<UpdateSettingsRequest>({
  name: restaurant.name,
  restaurantEmail: restaurant.restaurantEmail,
  phone: restaurant.phone,
  address: restaurant.address,

  tagline: restaurant.tagline,
  description: restaurant.description,
  cuisineType: restaurant.cuisineType,

  website: restaurant.website,
  instagram: restaurant.instagram,
  facebook: restaurant.facebook,
  customLink: restaurant.customLink,

  openingHours: cloneOpeningHours(restaurant.openingHours),
});

  const [logoUrl, setLogoUrl] = useState(
    restaurant.logoUrl ?? ""
  );

  const [coverUrl, setCoverUrl] = useState(
    restaurant.coverImageUrl ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const hasChanges = useMemo(() => {
    return (
      form.name !== restaurant.name ||
      form.restaurantEmail !== restaurant.restaurantEmail ||
      form.phone !== restaurant.phone ||
      form.address !== restaurant.address ||

      form.tagline !== restaurant.tagline ||
      form.description !== restaurant.description ||
      form.cuisineType !== restaurant.cuisineType ||

      form.website !== restaurant.website ||
form.instagram !== restaurant.instagram ||
form.facebook !== restaurant.facebook ||
form.customLink !== restaurant.customLink ||
JSON.stringify(form.openingHours) !==
  JSON.stringify(restaurant.openingHours)

    );
  }, [form, restaurant]);

  async function handleSave() {
    try {
      setSaving(true);

      const updated = await updateSettings(form);

      onUpdated(updated.restaurant);

      setForm({
        name: updated.restaurant.name,
        restaurantEmail: updated.restaurant.restaurantEmail,
        phone: updated.restaurant.phone,
        address: updated.restaurant.address,

        tagline: updated.restaurant.tagline,
        description: updated.restaurant.description,
        cuisineType: updated.restaurant.cuisineType,

        website: updated.restaurant.website,
        instagram: updated.restaurant.instagram,
        facebook: updated.restaurant.facebook,
        customLink: updated.restaurant.customLink,

        openingHours: cloneOpeningHours(
  updated.restaurant.openingHours,
),
      });

      setLogoUrl(updated.restaurant.logoUrl ?? "");
      setCoverUrl(updated.restaurant.coverImageUrl ?? "");

      toast.success("Settings updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingLogo(true);

      const updated = await uploadRestaurantLogo(file);

      setLogoUrl(updated.restaurant.logoUrl ?? "");

      onUpdated(updated.restaurant);

setForm({
  name: updated.restaurant.name,
  restaurantEmail:
    updated.restaurant.restaurantEmail,
  phone: updated.restaurant.phone,
  address: updated.restaurant.address,

  tagline: updated.restaurant.tagline,
  description: updated.restaurant.description,
  cuisineType: updated.restaurant.cuisineType,

  website: updated.restaurant.website,
  instagram: updated.restaurant.instagram,
  facebook: updated.restaurant.facebook,
  customLink: updated.restaurant.customLink,

  openingHours: cloneOpeningHours(
    updated.restaurant.openingHours,
  ),
});
      toast.success("Restaurant logo updated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleCoverUpload(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingCover(true);

      const updated = await uploadRestaurantCover(file);

      setCoverUrl(
        updated.restaurant.coverImageUrl ?? ""
      );

      onUpdated(updated.restaurant);

     setForm({
  name: updated.restaurant.name,
  restaurantEmail:
    updated.restaurant.restaurantEmail,
  phone: updated.restaurant.phone,
  address: updated.restaurant.address,

  tagline: updated.restaurant.tagline,
  description: updated.restaurant.description,
  cuisineType: updated.restaurant.cuisineType,

  website: updated.restaurant.website,
  instagram: updated.restaurant.instagram,
  facebook: updated.restaurant.facebook,
  customLink: updated.restaurant.customLink,

  openingHours: cloneOpeningHours(
    updated.restaurant.openingHours,
  ),
});

      toast.success("Cover image updated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  }

  return (
    <section className="space-y-8">
  <div className="flex items-center gap-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
      <Building2 className="h-6 w-6" />
    </div>

    <div>
      <h2 className="text-xl font-semibold text-stone-900">
        Restaurant Branding
      </h2>

      <p className="text-sm text-stone-500">
        Customize how your restaurant appears across CafeOS.
      </p>
    </div>
  </div>

  {/* Cover Image */}

  <div className="space-y-3">
    <Label className="text-sm font-medium">
      Cover Image
    </Label>

    <div className="relative aspect-[16/7] overflow-hidden rounded-3xl border border-stone-200 bg-stone-100">
  {coverUrl ? (
   <Image
  src={coverUrl}
  alt="Restaurant Cover"
  fill
  priority
  sizes="(max-width: 768px) 100vw, 70vw"
  className="object-cover object-[15%_center]"
/>
  ) : (
        <div className="flex h-56 w-full flex-col items-center justify-center gap-3 text-stone-400">
          <ImageIcon className="h-10 w-10" />

          <p className="text-sm">
            No cover image uploaded
          </p>
        </div>
      )}

      <div className="absolute bottom-5 right-5">
        <>
          <input
            ref={coverInputRef}
            hidden
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
          />

          <Button
            type="button"
            disabled={uploadingCover}
            onClick={() =>
              coverInputRef.current?.click()
            }
          >
            <Camera className="mr-2 h-4 w-4" />
            {uploadingCover
              ? "Uploading..."
              : "Change Cover"}
          </Button>
        </>
      </div>
    </div>
  </div>

  {/* Logo */}

  <div className="flex flex-col gap-6 rounded-3xl border border-stone-200 bg-stone-50 p-6 lg:flex-row lg:items-center">
    <div>
      {logoUrl ? (
       <Image
  src={logoUrl}
  alt="Restaurant Logo"
  width={96}
  height={96}
  className="h-24 w-24 rounded-full border border-stone-200 bg-white object-contain p-2 shadow-sm"
/>
      ) : (
<div className="flex h-28 w-28 items-center justify-center rounded-3xl border bg-white">   
         <Building2 className="h-10 w-10 text-stone-400" />
        </div>
      )}
    </div>

    <div className="flex-1 space-y-3">
      <div>
        <h3 className="text-lg font-semibold">
          Restaurant Logo
        </h3>

        <p className="text-sm text-stone-500">
         Displayed across your dashboard, QR menu and customer ordering experience.
        </p>
      </div>

      <>
        <input
          ref={logoInputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
        />

        <Button
          type="button"
          disabled={uploadingLogo}
          onClick={() =>
            logoInputRef.current?.click()
          }
        >
          <Camera className="mr-2 h-4 w-4" />
          {uploadingLogo
            ? "Uploading..."
            : "Change Logo"}
        </Button>
      </>
    </div>
  </div>

  {/* Restaurant Information */}

  <div className="rounded-3xl border border-stone-200 bg-white p-6">
    <div className="mb-6">
      <h3 className="text-lg font-semibold">
        Restaurant Information
      </h3>

      <p className="text-sm text-stone-500">
        Basic details displayed throughout CafeOS.
      </p>
    </div>

    <div className="grid gap-5 md:grid-cols-2">
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
        <Label>Cuisine Type</Label>

        <Input
          placeholder="Cafe"
          value={form.cuisineType ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              cuisineType: e.target.value,
            }))
          }
        />
      </div>
    </div>
  </div> 
    {/* Restaurant Profile */}

  <div className="rounded-3xl border border-stone-200 bg-white p-6">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-stone-900">
        Restaurant Profile
      </h3>

      <p className="text-sm text-stone-500">
        Tell customers more about your restaurant.
      </p>
    </div>

    <div className="space-y-5">
      <div>
        <Label>Tagline</Label>

        <Input
          placeholder="Fresh Coffee Everyday"
          value={form.tagline ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              tagline: e.target.value,
            }))
          }
        />
      </div>

      <div>
        <Label>Description</Label>

        <Textarea
          rows={5}
          placeholder="Describe your restaurant..."
          value={form.description ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
        />
      </div>

      <div>
        <Label>Address</Label>

        <Textarea
          rows={3}
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
  </div>

  {/* Opening Hours */}

  <div className="rounded-3xl border border-stone-200 bg-white p-6">
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
        <Clock3 className="h-5 w-5" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-stone-900">
          Opening Hours
        </h3>

        <p className="text-sm text-stone-500">
          Set the weekly hours customers will see on your QR menu.
        </p>
      </div>
    </div>

    <div className="space-y-3">
      {DAY_KEYS.map((day) => {
        const dayHours =
          form.openingHours?.[day] ?? {
            isOpen: false,
            open: null,
            close: null,
          };

        return (
          <div
            key={day}
            className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-between sm:w-36">
                <span className="font-medium text-stone-900">
                  {DAY_LABELS[day]}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const currentHours =
                      form.openingHours ??
                      createDefaultOpeningHours();

                    setForm((prev) => ({
                      ...prev,
                      openingHours: {
                        ...currentHours,
                        [day]: dayHours.isOpen
                          ? {
                              isOpen: false,
                              open: null,
                              close: null,
                            }
                          : {
                              isOpen: true,
                              open: dayHours.open ?? "09:00",
                              close: dayHours.close ?? "23:00",
                            },
                      },
                    }));
                  }}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    dayHours.isOpen
                      ? "bg-amber-500"
                      : "bg-stone-300"
                  }`}
                  aria-label={`Toggle ${DAY_LABELS[day]} opening status`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      dayHours.isOpen
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex-1">
                    <Label className="mb-1 block text-xs text-stone-500">
                      Opens
                    </Label>

                    <Input
                      type="time"
                      value={dayHours.open ?? ""}
                      disabled={!dayHours.isOpen}
                      onChange={(e) => {
                        const currentHours =
                          form.openingHours ??
                          createDefaultOpeningHours();

                        setForm((prev) => ({
                          ...prev,
                          openingHours: {
                            ...currentHours,
                            [day]: {
                              ...dayHours,
                              isOpen: true,
                              open: e.target.value,
                            },
                          },
                        }));
                      }}
                    />
                  </div>

                  <span className="mt-5 text-sm text-stone-400">
                    →
                  </span>

                  <div className="flex-1">
                    <Label className="mb-1 block text-xs text-stone-500">
                      Closes
                    </Label>

                    <Input
                      type="time"
                      value={dayHours.close ?? ""}
                      disabled={!dayHours.isOpen}
                      onChange={(e) => {
                        const currentHours =
                          form.openingHours ??
                          createDefaultOpeningHours();

                        setForm((prev) => ({
                          ...prev,
                          openingHours: {
                            ...currentHours,
                            [day]: {
                              ...dayHours,
                              isOpen: true,
                              close: e.target.value,
                            },
                          },
                        }));
                      }}
                    />
                  </div>
                </div>

                <span
                  className={`text-sm font-medium sm:w-20 sm:text-right ${
                    dayHours.isOpen
                      ? "text-emerald-600"
                      : "text-stone-400"
                  }`}
                >
                  {dayHours.isOpen ? "Open" : "Closed"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    <p className="mt-4 text-xs leading-5 text-stone-500">
      You can set different hours for every day. Overnight hours such as
      6:00 PM → 2:00 AM are supported.
    </p>
  </div>

  {/* Social Links */}

  <div className="rounded-3xl border border-stone-200 bg-white p-6">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-stone-900">
        Social Links
      </h3>

      <p className="text-sm text-stone-500">
        Help customers discover your restaurant online.
      </p>
    </div>

    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <Label>Website</Label>

        <Input
          placeholder="https://..."
          value={form.website ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              website: e.target.value,
            }))
          }
        />
      </div>

      <div>
        <Label>Instagram</Label>

        <Input
          placeholder="https://instagram.com/..."
          value={form.instagram ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              instagram: e.target.value,
            }))
          }
        />
      </div>

      <div>
        <Label>Facebook</Label>

        <Input
          placeholder="https://facebook.com/..."
          value={form.facebook ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              facebook: e.target.value,
            }))
          }
        />
      </div>

      <div>
        <Label>Custom Link</Label>

        <Input
          placeholder="https://..."
          value={form.customLink ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              customLink: e.target.value,
            }))
          }
        />
      </div>
    </div>
  </div>

  <div className="flex items-center justify-between rounded-3xl border border-stone-200 bg-white p-6">
    <div>
      {hasChanges ? (
        <p className="text-sm font-medium text-amber-600">
          You have unsaved changes.
        </p>
      ) : (
        <p className="text-sm text-stone-500">
          Everything is up to date.
        </p>
      )}
    </div>

    <Button
      onClick={handleSave}
      disabled={!hasChanges || saving}
      className="min-w-40"
    >
      {saving ? "Saving..." : "Save Changes"}
    </Button>
  </div>
</section>
  );
}
  