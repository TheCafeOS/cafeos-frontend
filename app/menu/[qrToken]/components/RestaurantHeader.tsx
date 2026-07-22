"use client";

import Image from "next/image";
import {
  Building2,

  ShoppingBag,
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
  };

  tableName: string;

  collapsedHeader: boolean;

  cartItemCount: number;

  currentOrder: CurrentOrder | null;

  onOpenCart: () => void;

  onOpenOrder: () => void;
};

export default function RestaurantHeader({
  restaurant,
  tableName,
  collapsedHeader,
  cartItemCount,
  currentOrder,
  onOpenCart,
  onOpenOrder,
}: RestaurantHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm">
      <div className="relative">
        <div
          className={`relative overflow-hidden transition-all duration-500 ${
            collapsedHeader ? "h-20" : "h-[320px]"
          }`}
        >
          {restaurant.coverImageUrl ? (
            <>
              <Image
                src={restaurant.coverImageUrl}
                alt={restaurant.name}
                fill
                priority
                quality={100}
                sizes="100vw"
                className={`object-cover object-center transition-all duration-500 ${
                  collapsedHeader
                    ? "-translate-y-10 scale-110 opacity-0"
                    : "translate-y-0 scale-100 opacity-100"
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-amber-50 to-white" />
          )}

          <div className="absolute right-5 top-5 flex gap-3">
            {currentOrder && (
              <CurrentOrderButton
                status={currentOrder.status}
                onClick={onOpenOrder}
              />
            )}

            <button
              type="button"
              onClick={onOpenCart}
              className="relative rounded-3xl bg-white/90 p-3 shadow-md backdrop-blur"
            >
              <ShoppingBag className="h-6 w-6 text-orange-700" />

              {cartItemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-600 px-1 text-xs font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

<div
  className={`relative mx-auto flex max-w-5xl flex-col items-transition-all duration-300center px-5 text-center  ${
    collapsedHeader ? "pb-2" : "pb-6"
  }`}
>          <div
  className={`relative flex items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-1 ring-black/5 transition-all duration-700 ease-out ${
    collapsedHeader
      ? "mx-auto -mt-2 h-16 w-16 border-2 border-white"
      : "mx-auto -mt-12 h-28 w-28 border-4 border-white"
  }`}
>
            {restaurant.logoUrl ? (
              <Image
                src={restaurant.logoUrl}
                alt={restaurant.name}
                fill
                className="object-contain p-1"
                sizes="128px"
              />
            ) : (
              <Building2 className="h-10 w-10 text-orange-600" />
            )}
          </div>

         {!collapsedHeader && (
  <h1 className="mt-3 text-center text-3xl font-bold text-stone-900">
    {restaurant.name}
  </h1>
)}
                    {!collapsedHeader && (
            <>
              {restaurant.tagline && (
                <p className="mt-2 max-w-xl text-sm text-stone-600 sm:text-base transition-all duration-300">
                  {restaurant.tagline}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 transition-all duration-300">
                <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm">
                  {tableName}
                </span>

                {restaurant.cuisineType && (
                  <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
                    {restaurant.cuisineType}
                  </span>
                )}
              </div>
            </>
          )}


        </div>
      </div>
    </header>
  );
}