"use client";

import { useLayoutEffect, useRef } from "react";
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

const EXPANDED_COVER_HEIGHT = 280;
const COLLAPSED_COVER_HEIGHT = 72;

const EXPANDED_LOGO_SIZE = 96;
const COLLAPSED_LOGO_SIZE = 40; // was 32 — too small to read at a glance
const LOGO_DOCK_SCALE = COLLAPSED_LOGO_SIZE / EXPANDED_LOGO_SIZE;

const NAME_GAP = 10;
const COLLAPSED_NAME_LINE_HEIGHT = 18; // approx, for vertical-centering math

const DOCK_LEFT = 18;
const DOCK_TOP = Math.round((COLLAPSED_COVER_HEIGHT - COLLAPSED_LOGO_SIZE) / 2);
const DOCK_TOP_NAME =
  DOCK_TOP + Math.round((COLLAPSED_LOGO_SIZE - COLLAPSED_NAME_LINE_HEIGHT) / 2);

// Wrapper collapses to just enough room for the docked logo, so the
// logo's full-size flow footprint (still reserved in layout even
// though transform has moved it visually) doesn't leave a gap between
// the collapsed header and the search bar below.
const WRAPPER_COLLAPSED_HEIGHT = DOCK_TOP + COLLAPSED_LOGO_SIZE + 8;

export default function RestaurantHeader({
  restaurant,
  tableName,
  cartItemCount,
  currentOrder,
  onOpenCart,
  onOpenOrder,
}: RestaurantHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const measureDelta = (
      el: HTMLElement,
      containerRect: DOMRect,
      targetLeft: number,
      targetTop: number,
    ) => {
      const previousTransform = el.style.transform;
      el.style.transform = "none";
      const rect = el.getBoundingClientRect();
      el.style.transform = previousTransform;

      return {
        dx: targetLeft - (rect.left - containerRect.left),
        dy: targetTop - (rect.top - containerRect.top),
      };
    };

    const measure = () => {
      const container = containerRef.current;
      const wrapper = wrapperRef.current;
      const logoEl = logoRef.current;
      const nameEl = nameRef.current;
      if (!container || !wrapper || !logoEl || !nameEl) return;

      const containerRect = container.getBoundingClientRect();

      // Logo + name dock deltas, written as CSS vars — no React
      // state, no re-render, on mount or on resize.
      const logoDelta = measureDelta(logoEl, containerRect, DOCK_LEFT, DOCK_TOP);
      logoEl.style.setProperty("--dock-x", `${logoDelta.dx}px`);
      logoEl.style.setProperty("--dock-y", `${logoDelta.dy}px`);

      const nameDelta = measureDelta(
        nameEl,
        containerRect,
        DOCK_LEFT + COLLAPSED_LOGO_SIZE + NAME_GAP,
        DOCK_TOP_NAME,
      );
      nameEl.style.setProperty("--dock-x", `${nameDelta.dx}px`);
      nameEl.style.setProperty("--dock-y", `${nameDelta.dy}px`);

      // Wrapper's natural (expanded) height, measured so the collapse
      // clamp below can shrink from a real number, not a guess.
      const previousHeight = wrapper.style.height;
      wrapper.style.height = "auto";
      const naturalHeight = wrapper.getBoundingClientRect().height;
      wrapper.style.height = previousHeight;
      wrapper.style.setProperty("--identity-expanded-height", `${naturalHeight}px`);

      // Max-width for the name, derived from the real container width
      // (handles the desktop max-w-5xl cap and any split-screen sizing
      // correctly — 100vw alone can't see the container's own cap).
      const containerWidth = containerRect.width;
      nameEl.style.setProperty(
        "--name-max-expanded",
        `${Math.max(160, containerWidth - 48)}px`,
      );
      nameEl.style.setProperty(
        "--name-max-collapsed",
        `${Math.max(120, containerWidth - 138)}px`,
      );
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [restaurant.name]);

  return (
    <header className="bg-white shadow-sm">
      <div ref={containerRef} className="relative">
        <div
          className="relative overflow-hidden"
          style={{
            height: `clamp(${COLLAPSED_COVER_HEIGHT}px, calc(${EXPANDED_COVER_HEIGHT}px - (var(--collapse-progress, 0) * ${
              EXPANDED_COVER_HEIGHT - COLLAPSED_COVER_HEIGHT
            }px)), ${EXPANDED_COVER_HEIGHT}px)`,
            contain: "layout style",
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
                className="object-cover"
                style={{
                  objectPosition: "center 30%",
                  transform:
                    "translateY(calc(var(--collapse-progress, 0) * -8%)) scale(calc(1 + var(--collapse-progress, 0) * 0.08))",
                  opacity: "calc(1 - var(--collapse-progress, 0) * 0.35)",
                }}
              />

              {/* More cinematic gradient depth */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(0,0,0,0.55), rgba(0,0,0,0.75))",
                  opacity: "calc(var(--collapse-progress, 0) * 0.85 + 0.1)",
                }}
              />
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
            The wrapper's height collapses (measured natural height ->
            WRAPPER_COLLAPSED_HEIGHT) with overflow hidden. This is
            what stops the logo's still-reserved flow space from
            leaving a gap once it's visually docked away. Logo and
            name inside stay in normal flow (so their expanded
            position is genuinely browser-computed, not manually
            re-derived) — only their own transform moves them.
          */}
          <div
            ref={wrapperRef}
            className="relative z-10 -mt-10 flex flex-col items-center overflow-hidden"
            style={{
              height:
                "calc(var(--identity-expanded-height, 140px) * (1 - var(--collapse-progress, 0)) + " +
                `${WRAPPER_COLLAPSED_HEIGHT}px * var(--collapse-progress, 0))`,
            }}
          >
            <div
              ref={logoRef}
              className="relative flex shrink-0 items-center justify-center"
              style={{
                width: EXPANDED_LOGO_SIZE,
                height: EXPANDED_LOGO_SIZE,
                transform: `translate(calc(var(--collapse-progress, 0) * var(--dock-x, 0px)), calc(var(--collapse-progress, 0) * var(--dock-y, 0px))) scale(calc(1 - var(--collapse-progress, 0) * ${1 - LOGO_DOCK_SCALE}))`,
                transformOrigin: "top left",
                willChange: "transform",
              }}
            >
              <div
                className="absolute inset-0 rounded-full bg-white shadow-md ring-1 ring-black/5"
                style={{ opacity: "calc(1 - var(--collapse-progress, 0) * 1.3)" }}
              />

              <div className="absolute inset-0 overflow-hidden rounded-full">
                {restaurant.logoUrl ? (
                  <Image
                    src={restaurant.logoUrl}
                    alt={restaurant.name}
                    fill
                    className="object-contain p-1"
                    sizes="128px"
                  />
                ) : (
                  <Building2 className="absolute inset-0 m-auto h-10 w-10 text-orange-600" />
                )}
              </div>
            </div>

            {/*
              line-clamp-2 -> line-clamp-1 is a keyword change with no
              continuous in-between, so it's the one thing toggled via
              a class (from the same rAF loop in page.tsx, no React
              state). Threshold moved to 0.8 — text stays wrapped until
              the collapse is almost finished.
            */}
            <h1
              ref={nameRef}
              className="mt-3 line-clamp-2 text-center font-bold leading-none tracking-tight text-stone-900 [.header-docked_&]:line-clamp-1"
              style={{
                fontSize:
                  "clamp(1.125rem, calc(2rem - (var(--collapse-progress, 0) * 0.875rem)), 2rem)",
                maxWidth:
                  "calc(var(--name-max-expanded, 300px) * (1 - var(--collapse-progress, 0)) + var(--name-max-collapsed, 160px) * var(--collapse-progress, 0))",
                transform: `translate(calc(var(--collapse-progress, 0) * var(--dock-x, 0px)), calc(var(--collapse-progress, 0) * var(--dock-y, 0px)))`,
                willChange: "transform",
              }}
            >
              {restaurant.name}
            </h1>
          </div>

          <div
            className="flex flex-col items-center text-center"
            style={{
              paddingBottom:
                "clamp(8px, calc(24px - (var(--collapse-progress, 0) * 16px)), 24px)",
            }}
          >
            {restaurant.tagline && (
              <p
                className="mt-3 max-w-xl overflow-hidden text-sm text-stone-600 sm:text-base"
                style={{
                  opacity: "calc(1 - (var(--collapse-progress, 0) * 5))",
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
                <span className="inline-flex max-w-[220px] items-center truncate rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
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