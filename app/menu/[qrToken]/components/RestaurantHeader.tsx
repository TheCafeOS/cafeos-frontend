"use client";

import { useLayoutEffect, useRef, useState } from "react";
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

const EXPANDED_COVER_HEIGHT = 320;
const COLLAPSED_COVER_HEIGHT = 80;

const EXPANDED_LOGO_SIZE = 112;
const COLLAPSED_LOGO_SIZE = 40;
const DOCK_SCALE = COLLAPSED_LOGO_SIZE / EXPANDED_LOGO_SIZE;

// Where the docked (collapsed) logo+name should sit, measured from the
// top-left corner of the outer relative container — same frame of
// reference the cart button uses (right-5/top-5), so everything lines
// up in the compact bar without guesswork.
const DOCK_LEFT = 20; // matches px-5
const DOCK_TOP = 20; // centers a 40px logo inside the 80px collapsed cover

export default function RestaurantHeader({
  restaurant,
  tableName,
  cartItemCount,
  currentOrder,
  onOpenCart,
  onOpenOrder,
}: RestaurantHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null); // reference frame for measurement
  const identityRef = useRef<HTMLDivElement>(null); // logo + name, single migrating unit

  const [dock, setDock] = useState({ dx: 0, dy: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const el = identityRef.current;
      const container = containerRef.current;
      if (!el || !container) return;

      // Temporarily strip the transform so we measure the element's
      // true natural (expanded) position, regardless of current
      // scroll progress. This is synchronous — no flicker, since we
      // restore it before the browser paints.
      const previousTransform = el.style.transform;
      el.style.transform = "none";

      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      el.style.transform = previousTransform;

      setDock({
        dx: DOCK_LEFT - (elRect.left - containerRect.left),
        dy: DOCK_TOP - (elRect.top - containerRect.top),
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [restaurant.name]); // re-measure if the name text changes width

  return (
    <header className="bg-white shadow-sm">
      <div ref={containerRef} className="relative">
        {/* Cover: stays visible and darkens instead of fading to nothing */}
        <div
          className="relative overflow-hidden"
          style={{
            height: `clamp(${COLLAPSED_COVER_HEIGHT}px, calc(${EXPANDED_COVER_HEIGHT}px - (var(--collapse-progress, 0) * ${
              EXPANDED_COVER_HEIGHT - COLLAPSED_COVER_HEIGHT
            }px)), ${EXPANDED_COVER_HEIGHT}px)`,
          }}
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
                className="object-cover object-center"
                style={{
                  transform:
                    "translateY(calc(var(--collapse-progress, 0) * -8%)) scale(calc(1 + var(--collapse-progress, 0) * 0.08))",
                  opacity: "calc(1 - var(--collapse-progress, 0) * 0.35)",
                }}
              />

              {/* Darkening overlay grows with collapse instead of the image vanishing */}
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: "calc(var(--collapse-progress, 0) * 0.45)" }}
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

        <div className="mx-auto max-w-5xl px-5">
          {/*
            The docking unit. Always mounted, always the same DOM node.
            Its natural (expanded) position is measured above; its
            docked (collapsed) position is the DOCK_LEFT/DOCK_TOP
            constants. Motion is a single transform interpolated by
            --collapse-progress — no opacity swap, no display toggle.
          */}
          <div
            ref={identityRef}
            className="relative z-10 -mt-12 flex w-fit items-center gap-3"
            style={{
              transform: `translate(calc(var(--collapse-progress, 0) * ${dock.dx}px), calc(var(--collapse-progress, 0) * ${dock.dy}px)) scale(calc(1 - var(--collapse-progress, 0) * ${1 - DOCK_SCALE}))`,
              transformOrigin: "top left",
              willChange: "transform",
            }}
          >
            <div
              className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md ring-1 ring-black/5"
              style={{ width: EXPANDED_LOGO_SIZE, height: EXPANDED_LOGO_SIZE }}
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

            <h1 className="whitespace-nowrap text-3xl font-bold text-stone-900">
              {restaurant.name}
            </h1>
          </div>

          {/* Tagline + chips: unchanged behavior — fade and collapse height, centered under the identity block */}
          <div
            className="flex flex-col items-center text-center"
            style={{
              paddingBottom:
                "clamp(8px, calc(24px - (var(--collapse-progress, 0) * 16px)), 24px)",
            }}
          >
            {restaurant.tagline && (
              <p
                className="mt-2 max-w-xl overflow-hidden text-sm text-stone-600 sm:text-base"
                style={{
                  opacity: "calc(1 - (var(--collapse-progress, 0) * 3))",
                  maxHeight:
                    "clamp(0px, calc(60px - (var(--collapse-progress, 0) * 60px)), 60px)",
                }}
              >
                {restaurant.tagline}
              </p>
            )}

            <div
              className="mt-4 flex flex-wrap items-center justify-center gap-3 overflow-hidden"
              style={{
                opacity: "calc(1 - (var(--collapse-progress, 0) * 2))",
                maxHeight:
                  "clamp(0px, calc(48px - (var(--collapse-progress, 0) * 48px)), 48px)",
              }}
            >
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm">
                {tableName}
              </span>

              {restaurant.cuisineType && (
                <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
                  {restaurant.cuisineType}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}