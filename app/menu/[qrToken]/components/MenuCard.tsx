"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, Star, XCircle } from "lucide-react";
import { UtensilsCrossed } from "lucide-react";

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  imageUrl: string | null;
  categoryId: string | null;
  isAvailable?: boolean;
  // Optional / decorative — safe to omit, card degrades gracefully.
  rating?: number;
  reviewCount?: number;
};

type MenuCardProps = {
  item: MenuItem;
  formatPrice: (price: string | number) => string;

  quantity: number;

  isFeatured?: boolean;

  onAddToCart: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
};
type QuantityStepperProps = {
  compact?: boolean;
  quantity: number;
  isUnavailable: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
};

function QuantityStepper({
  compact = false,
  quantity,
  isUnavailable,
  onIncrease,
  onDecrease,
}: QuantityStepperProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border border-orange-500/20 bg-orange-500/10 ${
        compact ? "gap-1 p-1" : "gap-2 p-1.5"
      }`}
    >
      <button
        type="button"
        onClick={onDecrease}
        className={`flex items-center justify-center rounded-lg bg-neutral-800 text-neutral-100 transition hover:bg-neutral-700 active:scale-95 ${
          compact ? "h-6 w-6 sm:h-7 sm:w-7" : "h-8 w-8"
        }`}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="min-w-[1.25rem] text-center text-sm font-bold text-orange-400">
        {quantity}
      </span>

      <button
        type="button"
        disabled={isUnavailable}
        onClick={onIncrease}
        className={`flex items-center justify-center rounded-lg bg-orange-500 text-white transition hover:bg-orange-600 active:scale-95 disabled:bg-neutral-700 ${
        compact ? "h-6 w-6 sm:h-7 sm:w-7" : "h-8 w-8"
        }`}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
// Two layouts sharing one component:
// - isFeatured (Popular Today rail): vertical card, image on top, plus
//   button floats bottom-right over the content.
// - default (full menu list): compact horizontal card — image left,
//   content right — per spec ("no massive white cards").
export default function MenuCard({
  item,
  formatPrice,
  quantity,
  isFeatured = false,
  onAddToCart,
  onIncrease,
  onDecrease,
}: MenuCardProps) {
  const isUnavailable = item.isAvailable === false;




  // ---------- Popular Today (vertical) ----------
  if (isFeatured) {
    return (
      <article className="group relative overflow-hidden rounded-3xl bg-[#171A20] shadow-lg shadow-black/20 transition-transform duration-300 hover:-translate-y-1">
        <div className="relative h-28 w-full sm:h-32">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="220px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-4xl">
             <UtensilsCrossed className="h-10 w-10 text-neutral-500" />
            </div>
          )}

          

          {isUnavailable && (
            <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white">
              <XCircle className="h-3 w-3" />
              Sold out
            </span>
          )}
        </div>

        <div className="p-3">
<h3 className="truncate text-sm font-bold text-neutral-100 sm:text-[15px]">            {item.name}
          </h3>

          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm font-bold text-orange-400">
              {formatPrice(item.price)}
            </span>

            {item.rating != null && (
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {item.rating.toFixed(1)}
                {item.reviewCount != null && ` (${item.reviewCount})`}
              </span>
            )}
          </div>

          <div className="mt-3">
            {quantity === 0 ? (
              <button
                type="button"
                disabled={isUnavailable}
                onClick={onAddToCart}
                aria-label="Add to cart"
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition hover:bg-orange-600 active:scale-90 disabled:bg-neutral-700 disabled:text-neutral-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            ) : (
              <QuantityStepper
  compact
  quantity={quantity}
  isUnavailable={isUnavailable}
  onIncrease={onIncrease}
  onDecrease={onDecrease}
/>
            )}
          </div>
        </div>
      </article>
    );
  }

  // ---------- Full menu (compact horizontal) ----------
  return (
<article className="flex w-full gap-3 rounded-2xl bg-[#171A20] p-3 transition-colors duration-200 hover:bg-[#1c2028]">     
<div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]">        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="120px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-3xl">
            🍽️
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
<h3 className="truncate text-sm font-bold text-neutral-100 sm:text-[15px]">            {item.name}
          </h3>

          <span className="shrink-0 text-sm font-bold text-orange-400">
            {formatPrice(item.price)}
          </span>
        </div>

<p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-400 sm:text-[13px]">          {item.description || "Freshly prepared and served with care."}
        </p>

        <div className="mt-auto flex items-center justify-between pt-1.5">
          {isUnavailable ? (
            <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-semibold text-red-400">
              <XCircle className="h-3 w-3" />
              Unavailable
            </span>
          ) : (
            <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-[11px] font-semibold text-green-400">
              Available
            </span>
          )}

          {quantity === 0 ? (
            <button
              type="button"
              disabled={isUnavailable}
              onClick={onAddToCart}
              aria-label="Add to cart"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition hover:bg-orange-600 active:scale-90 disabled:bg-neutral-700 disabled:text-neutral-500"
            >
              <Plus className="h-4 w-4" />
            </button>
          ) : (
            <QuantityStepper
  compact
  quantity={quantity}
  isUnavailable={isUnavailable}
  onIncrease={onIncrease}
  onDecrease={onDecrease}
/>
          )}
        </div>
      </div>
    </article>
  );
}