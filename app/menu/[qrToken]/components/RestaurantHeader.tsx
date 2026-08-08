"use client";

import Image from "next/image";
import {
  Building2,
  ShoppingBag,
  Gift,
  Info,
} from "lucide-react";


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
    // Optional / decorative — only rendered if present.
    isOpen?: boolean;
    address?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    instagramUrl?: string | null;
    mapsUrl?: string | null;
    openingHours?: string | null;
  };
  tableName: string;
  cartItemCount: number;
  currentOrder: CurrentOrder | null;
  onOpenCart: () => void;
  onOpenOrder: () => void;
onOpenLoyalty?: () => void;
  onOpenRestaurantInfo: () => void;
};

export default function RestaurantHeader({
  restaurant,
  tableName,
  cartItemCount,
  currentOrder,
  onOpenCart,
  onOpenOrder,
 onOpenLoyalty,
onOpenRestaurantInfo,
}: RestaurantHeaderProps)
 {

  const isOpen = restaurant.isOpen ?? true;

  return (
    <>
      <div className="border-b border-white/5 bg-[#0F1115]/80 shadow-lg shadow-black/20 backdrop-blur-xl rounded-b-2xl">
        {/* Row 1: identity + actions */}
        <header className="h-[86px] sm:h-[94px]">
          <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-4 px-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-800 ring-1 ring-white/10">
                {restaurant.logoUrl ? (
                  <Image
                    src={restaurant.logoUrl}
                    alt={restaurant.name}
                    fill
                    className="object-contain p-1.5"
                    sizes="56px"
                  />
                ) : (
                  <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-orange-500" />
                )}
              </div>

              <div className="min-w-0 py-1">
                <p className="truncate text-[19px] sm:text-[22px] font-bold leading-tight text-neutral-100">
                  {restaurant.name}
                </p>

                <div className="mt-1.5 flex flex-col gap-1 text-[11px] sm:text-xs text-neutral-500">
                  <span className="truncate">{tableName}</span>

<div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
    <span
    className={`flex items-center gap-1.5 ${
      isOpen ? "text-green-400" : "text-neutral-500"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        isOpen ? "bg-green-400" : "bg-neutral-500"
      }`}
    />
    {isOpen ? "Open Now" : "Closed"}
  </span>

  <span className="text-neutral-700">•</span>

  <button
    type="button"
    onClick={onOpenRestaurantInfo}
className="group flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-200 hover:text-orange-400 transition-colors duration-200 hover:text-orange-400"
  >
<Info className="h-5 w-5 opacity-80 transition-opacity group-hover:opacity-100" />    <span>Restaurant Info</span>
  </button>
</div>


                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              {currentOrder && (
                <CurrentOrderButton
                  status={currentOrder.status}
                  onClick={onOpenOrder}
                />
              )}
{onOpenLoyalty && (
  <button
    type="button"
    aria-label="Loyalty Rewards"
    onClick={onOpenLoyalty}
    className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-neutral-800 text-orange-400 transition-colors duration-200 hover:border-orange-400/30 hover:bg-neutral-700 active:scale-95"
  >
    <Gift className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
  </button>
)}

              <button
                type="button"
                aria-label="Open cart"
                onClick={onOpenCart}
                className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-neutral-800 text-orange-400 transition-colors duration-200 hover:border-orange-400/30 hover:bg-neutral-700 active:scale-95"
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
        </header>
      </div>

      

      
    </>
  );
}