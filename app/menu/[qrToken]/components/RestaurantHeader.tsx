"use client";

import Image from "next/image";
import { Building2, ShoppingBag } from "lucide-react";

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
  };

  tableName: string;

  cartItemCount: number;

  currentOrder: CurrentOrder | null;

  onOpenCart: () => void;

  onOpenOrder: () => void;
};

// No cover photo, no scroll-driven collapse — this bar is always the
// same compact size, so there's nothing left to animate and nothing
// left to flicker. restaurant.coverImageUrl/tagline/cuisineType are
// intentionally unused here; say the word if you want a small
// subtitle line back in.
export default function RestaurantHeader({
  restaurant,
  tableName,
  cartItemCount,
  currentOrder,
  onOpenCart,
  onOpenOrder,
}: RestaurantHeaderProps) {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-100 ring-1 ring-black/5">
            {restaurant.logoUrl ? (
              <Image
                src={restaurant.logoUrl}
                alt={restaurant.name}
                fill
                className="object-contain p-1"
                sizes="40px"
              />
            ) : (
              <Building2 className="h-5 w-5 text-orange-600" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-tight text-stone-900">
              {restaurant.name}
            </p>
            <p className="truncate text-xs text-stone-500">{tableName}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {currentOrder && (
            <CurrentOrderButton
              status={currentOrder.status}
              onClick={onOpenOrder}
            />
          )}

          <button
            type="button"
            onClick={onOpenCart}
            className="relative rounded-full bg-orange-50 p-2.5 text-orange-700 transition hover:bg-orange-100"
          >
            <ShoppingBag className="h-5 w-5" />

            {cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-bold text-white">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}