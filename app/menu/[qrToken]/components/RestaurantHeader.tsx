"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  ShoppingBag,
  Star,
  UtensilsCrossed,
  Flame,
  Info,
  Phone,
  X,
  MapPin,
  MessageCircle,
  Mail,
  Clock,
  Camera,
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
    rating?: number;
    reviewCount?: number;
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
  // Optional nav scroll targets — page.tsx can wire these to
  // scrollIntoView calls. Safe no-ops if not provided.
  onNavigateMenu?: () => void;
  onNavigatePopular?: () => void;
};

type NavKey = "menu" | "popular" | "about" | "contact";

export default function RestaurantHeader({
  restaurant,
  tableName,
  cartItemCount,
  currentOrder,
  onOpenCart,
  onOpenOrder,
  onNavigateMenu,
  onNavigatePopular,
}: RestaurantHeaderProps) {
  const [activeNav, setActiveNav] = useState<NavKey>("menu");
  const [sheet, setSheet] = useState<"about" | "contact" | null>(null);

  const isOpen = restaurant.isOpen ?? true;

  function handleNav(key: NavKey) {
    setActiveNav(key);

    if (key === "menu") {
      onNavigateMenu?.();
    } else if (key === "popular") {
      onNavigatePopular?.();
    } else {
      setSheet(key);
    }
  }

  const navItems: { key: NavKey; label: string; icon: typeof UtensilsCrossed }[] = [
    { key: "menu", label: "Menu", icon: UtensilsCrossed },
    { key: "popular", label: "Popular", icon: Flame },
    { key: "about", label: "About", icon: Info },
    { key: "contact", label: "Contact", icon: Phone },
  ];

  return (
    <>
      <div className="border-b border-white/5 bg-[#0F1115]/80 shadow-lg shadow-black/20 backdrop-blur-xl rounded-b-2xl">
        {/* Row 1: identity + cart */}
        <header className="h-[72px]">
          <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-3 px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-800 ring-1 ring-white/10">
                {restaurant.logoUrl ? (
                  <Image
                    src={restaurant.logoUrl}
                    alt={restaurant.name}
                    fill
                    className="object-contain p-1.5"
                    sizes="48px"
                  />
                ) : (
                  <Building2 className="h-6 w-6 text-orange-500" />
                )}
              </div>

              <div className="min-w-0 leading-tight">
                <p className="truncate text-lg font-bold leading-tight text-neutral-100">
                  {restaurant.name}
                </p>

                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
                  <span className="truncate">{tableName}</span>

                  {restaurant.rating != null && (
                    <>
                      <span className="text-neutral-600">·</span>
                      <span className="flex items-center gap-0.5 text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {restaurant.rating.toFixed(1)}
                        {restaurant.reviewCount != null &&
                          ` (${restaurant.reviewCount}+)`}
                      </span>
                    </>
                  )}

                  <span className="text-neutral-600">·</span>
                  <span
                    className={`flex items-center gap-1 ${
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
                </div>
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
                aria-label="Open cart"
                onClick={onOpenCart}
                className="relative rounded-full bg-neutral-800 p-2.5 text-orange-400 transition hover:bg-neutral-700 active:scale-95"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Row 2: pill navigation */}
        <nav className="mx-auto flex max-w-5xl items-center gap-1 px-5 pb-3">
          {navItems.map(({ key, label, icon: Icon }) => {
            const isActive = activeNav === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleNav(key)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-orange-500/15 text-orange-400"
                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* About bottom sheet */}
      <BottomSheet
        open={sheet === "about"}
        onClose={() => setSheet(null)}
        title="About"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-800 ring-1 ring-white/10">
            {restaurant.logoUrl ? (
              <Image
                src={restaurant.logoUrl}
                alt={restaurant.name}
                fill
                className="object-contain p-1.5"
                sizes="56px"
              />
            ) : (
              <Building2 className="h-6 w-6 text-orange-500" />
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-neutral-100">
              {restaurant.name}
            </p>
            {restaurant.cuisineType && (
              <p className="text-sm text-neutral-400">
                {restaurant.cuisineType}
              </p>
            )}
          </div>
        </div>

        {restaurant.tagline && (
          <p className="mt-4 text-sm leading-6 text-neutral-300">
            {restaurant.tagline}
          </p>
        )}

        <div className="mt-4 space-y-3">
          {restaurant.openingHours && (
            <SheetRow icon={Clock} text={restaurant.openingHours} />
          )}
          {restaurant.address && (
            <SheetRow icon={MapPin} text={restaurant.address} />
          )}
          {restaurant.instagramUrl && (
            <SheetRow
              icon={Camera}
              text="Camera"
              href={restaurant.instagramUrl}
            />
          )}
          {restaurant.mapsUrl && (
            <SheetRow
              icon={MapPin}
              text="View on Google Maps"
              href={restaurant.mapsUrl}
            />
          )}
        </div>
      </BottomSheet>

      {/* Contact bottom sheet */}
      <BottomSheet
        open={sheet === "contact"}
        onClose={() => setSheet(null)}
        title="Contact"
      >
        <div className="space-y-3">
          {restaurant.phone && (
            <SheetRow icon={Phone} text={restaurant.phone} href={`tel:${restaurant.phone}`} />
          )}
          {restaurant.whatsapp && (
            <SheetRow
              icon={MessageCircle}
              text="WhatsApp"
              href={`https://wa.me/${restaurant.whatsapp}`}
            />
          )}
          {restaurant.email && (
            <SheetRow icon={Mail} text={restaurant.email} href={`mailto:${restaurant.email}`} />
          )}
          {restaurant.mapsUrl && (
            <SheetRow icon={MapPin} text="Directions" href={restaurant.mapsUrl} />
          )}
          {!restaurant.phone &&
            !restaurant.whatsapp &&
            !restaurant.email &&
            !restaurant.mapsUrl && (
              <p className="text-sm text-neutral-400">
                Contact details aren&apos;t available yet — please ask a staff
                member.
              </p>
            )}
        </div>
      </BottomSheet>
    </>
  );
}

function SheetRow({
  icon: Icon,
  text,
  href,
}: {
  icon: typeof MapPin;
  text: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 transition hover:bg-white/10">
      <Icon className="h-4 w-4 shrink-0 text-orange-400" />
      <span className="truncate text-sm text-neutral-200">{text}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}

function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl bg-[#171A20] p-6 shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-100">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-neutral-300 transition hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}