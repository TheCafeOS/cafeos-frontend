"use client";

import Image from "next/image";
import {
  ShoppingBag,
  Gift,
  Info,
} from "lucide-react";

import type { OpeningHours } from "@/types/opening-hours";
import { getRestaurantOpenStatus } from "@/utils/opening-hours";

import CurrentOrderButton from "./CurrentOrderButton";
import type { CurrentOrder } from "./CurrentOrderDrawer";

type RestaurantHeaderProps = {
  restaurant: {
    id: string;
    name: string;
    slug: string;

    logoUrl: string | null;
    coverImageUrl: string | null;

    tagline: string | null;
    cuisineType: string | null;
    themeColor: string | null;

    address?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    instagramUrl?: string | null;
    mapsUrl?: string | null;

    openingHours?: OpeningHours | null;
  };

  tableName: string;
  cartItemCount: number;

  currentOrders: CurrentOrder[];

  onOpenCart: () => void;
  onOpenOrder: () => void;
  onOpenLoyalty?: () => void;
  onOpenRestaurantInfo: () => void;
};

export default function RestaurantHeader({
  restaurant,
  tableName,
  cartItemCount,
  currentOrders,
  onOpenCart,
  onOpenOrder,
  onOpenLoyalty,
  onOpenRestaurantInfo,
}: RestaurantHeaderProps) {
  /*
   * Opening status is calculated from the restaurant's weekly
   * opening hours.
   *
   * This also handles overnight schedules such as:
   * 18:00 → 02:00
   */
  const openStatus = getRestaurantOpenStatus(
    restaurant.openingHours,
  );

  return (
    <header className="border-b border-white/5 bg-[#0F1115]/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Restaurant identity */}
          <div className="flex min-w-0 items-center gap-3">
            {/* Logo */}
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-800 sm:h-16 sm:w-16">
              {restaurant.logoUrl ? (
                <Image
                  src={restaurant.logoUrl}
                  alt={`${restaurant.name} logo`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-orange-400">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              )}
            </div>

            {/* Name + table + status + info */}
            <div className="min-w-0 py-1">
              <p className="truncate text-[19px] font-bold leading-tight text-neutral-100 sm:text-[22px]">
                {restaurant.name}
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs">
                <span className="truncate text-neutral-500">
                  {tableName}
                </span>

                <span className="text-neutral-700">•</span>

                {/* Open / Closed status */}
                <span
                  className={`flex items-center gap-1.5 font-medium ${
                    openStatus.isOpen
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      openStatus.isOpen
                        ? "bg-emerald-400"
                        : "bg-red-400"
                    }`}
                  />

                  {openStatus.isOpen ? "Open Now" : "Closed"}
                </span>

                {/* Opening-hours message */}
                <span className="text-neutral-500">
                  {openStatus.message}
                </span>

                {/* Restaurant information */}
                <button
                  type="button"
                  onClick={onOpenRestaurantInfo}
                  className="group flex items-center gap-1.5 text-xs font-medium text-neutral-200 transition-colors duration-200 hover:text-orange-400 sm:text-sm"
                >
                  <Info className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-orange-400" />

                  <span>Restaurant Info</span>
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            {/* Current orders */}
            {currentOrders.length > 0 && (
              <CurrentOrderButton
                status={currentOrders[0]?.status}
                orderCount={currentOrders.length}
                onClick={onOpenOrder}
              />
            )}

            {/* Loyalty */}
            {onOpenLoyalty && (
              <button
                type="button"
                aria-label="Loyalty Rewards"
                onClick={onOpenLoyalty}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-800 text-orange-400 transition-colors duration-200 hover:border-orange-400/30 hover:bg-neutral-700 active:scale-95 sm:h-10 sm:w-10"
              >
                <Gift className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </button>
            )}

            {/* Cart */}
            <button
              type="button"
              aria-label="Open cart"
              onClick={onOpenCart}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-800 text-orange-400 transition-colors duration-200 hover:border-orange-400/30 hover:bg-neutral-700 active:scale-95 sm:h-10 sm:w-10"
            >
              <ShoppingBag className="h-4.5 w-4.5 sm:h-5 sm:w-5" />

              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}