"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";import Image from "next/image";
import {
  Building2,
  Camera,
  ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  updateSettings,
  uploadRestaurantLogo,
  uploadRestaurantCover,
} from "@/services/settings.service";

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

    themeColor: restaurant.themeColor ?? "#F59E0B",
  });

  const [logoUrl, setLogoUrl] = useState(
    restaurant.logoUrl ?? ""
  );

  const [coverUrl, setCoverUrl] = useState(
    restaurant.coverImageUrl ?? ""
  );

  const [saving, setSaving] = useState(false);

  const [uploadingLogo, setUploadingLogo] =
    useState(false);

  const [uploadingCover, setUploadingCover] =
    useState(false);
const logoInputRef = useRef<HTMLInputElement>(null);
const coverInputRef = useRef<HTMLInputElement>(null);

  const hasChanges = useMemo(() => {
    return (
      form.name !== restaurant.name ||
      form.restaurantEmail !==
        restaurant.restaurantEmail ||
      form.phone !== restaurant.phone ||
      form.address !== restaurant.address ||

      form.tagline !== restaurant.tagline ||
      form.description !==
        restaurant.description ||
      form.cuisineType !==
        restaurant.cuisineType ||

      form.website !== restaurant.website ||
      form.instagram !==
        restaurant.instagram ||
      form.facebook !==
        restaurant.facebook ||
      form.customLink !==
        restaurant.customLink ||

      form.themeColor !==
        restaurant.themeColor
    );
  }, [form, restaurant]);

  async function handleSave() {
    try {
      setSaving(true);

      const updated =
        await updateSettings(form);

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

  themeColor:
    updated.restaurant.themeColor ?? "#F59E0B",
});

setLogoUrl(updated.restaurant.logoUrl ?? "");
setCoverUrl(updated.restaurant.coverImageUrl ?? "");
      alert("Settings updated successfully.");
    } catch (error) {
      console.error(error);

      alert("Failed to update settings.");
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

      const updated =
        await uploadRestaurantLogo(file);

      setLogoUrl(
        updated.restaurant.logoUrl ?? ""
      );

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

  themeColor:
    updated.restaurant.themeColor ?? "#F59E0B",
});
      alert("Logo updated successfully.");
    } catch (error) {
      console.error(error);

      alert("Logo upload failed.");
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

      const updated =
        await uploadRestaurantCover(file);

      setCoverUrl(
        updated.restaurant.coverImageUrl ?? ""
      );

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

  themeColor:
    updated.restaurant.themeColor ?? "#F59E0B",
});
      alert("Cover image updated.");
    } catch (error) {
      console.error(error);

      alert("Cover upload failed.");
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

    <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-stone-100">

      {coverUrl ? (
        <Image
          src={coverUrl}
          alt="Restaurant Cover"
          width={1200}
          height={400}
          className="h-56 w-full object-cover"
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
    onClick={() => coverInputRef.current?.click()}
  >
    <Camera className="mr-2 h-4 w-4" />
    {uploadingCover ? "Uploading..." : "Change Cover"}
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
          width={120}
          height={120}
          className="h-28 w-28 rounded-3xl border object-cover shadow"
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
          This logo will appear in your dashboard,
          QR menu and customer experience.
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
    onClick={() => logoInputRef.current?.click()}
  >
    <Camera className="mr-2 h-4 w-4" />
    {uploadingLogo ? "Uploading..." : "Upload Logo"}
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

        <Label>
          Restaurant Name
        </Label>

        <Input
          value={form.name}
          onChange={(e)=>
            setForm(prev=>({
              ...prev,
              name:e.target.value
            }))
          }
        />

      </div>

      <div>

        <Label>
          Restaurant Email
        </Label>

        <Input
          type="email"
          value={form.restaurantEmail}
          onChange={(e)=>
            setForm(prev=>({
              ...prev,
              restaurantEmail:e.target.value
            }))
          }
        />

      </div>

      <div>

        <Label>
          Phone
        </Label>

        <Input
          value={form.phone ?? ""}
          onChange={(e)=>
            setForm(prev=>({
              ...prev,
              phone:e.target.value
            }))
          }
        />

      </div>

      <div>

        <Label>
          Cuisine Type
        </Label>

        <Input
          placeholder="Cafe"
          value={form.cuisineType ?? ""}
          onChange={(e)=>
            setForm(prev=>({
              ...prev,
              cuisineType:e.target.value
            }))
          }
        />

      </div>

    </div>

  </div>   {/* Restaurant Profile */}

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
    {/* Theme */}

  <div className="rounded-3xl border border-stone-200 bg-white p-6">

    <div className="mb-6">
      <h3 className="text-lg font-semibold text-stone-900">
        Theme
      </h3>

      <p className="text-sm text-stone-500">
        Choose your restaurant brand color.
      </p>
    </div>

    <div className="max-w-xs">

      <Label>Theme Color</Label>

      <div className="mt-2 flex items-center gap-4">

        <input
          type="color"
          value={form.themeColor ?? "#F59E0B"}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              themeColor: e.target.value,
            }))
          }
          className="h-14 w-20 cursor-pointer rounded-lg border"
        />

        <Input
          value={form.themeColor ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              themeColor: e.target.value,
            }))
          }
        />

      </div>

    </div>

  </div>

  <div className="flex items-center justify-between rounded-3xl border border-stone-200 bg-white p-6">

    <div>

      {hasChanges ? (

        <p className="text-sm text-amber-600 font-medium">
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