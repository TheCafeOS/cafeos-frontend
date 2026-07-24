"use client";

import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { UtensilsCrossed } from "lucide-react";
import type { FoodType } from "@/types/menu-item";

/* ---------- Food Type Badge ---------- */

const FOOD_TYPE_CONFIG: Record<
  FoodType,
  {
    label: string;
    dot: string;
    bg: string;
    text: string;
    border: string;
  }
> = {
  VEG: {
    label: "Veg",
    dot: "bg-green-500",
    bg: "bg-green-50/95",
    text: "text-green-700",
    border: "border-green-200",
  },
  NON_VEG: {
    label: "Non-Veg",
    dot: "bg-red-500",
    bg: "bg-red-50/95",
    text: "text-red-700",
    border: "border-red-200",
  },
  EGG: {
    label: "Egg",
    dot: "bg-yellow-500",
    bg: "bg-yellow-50/95",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
};

export function FoodTypeBadge({
  foodType,
  className,
}: {
  foodType: FoodType;
  className?: string;
}) {
  const config = FOOD_TYPE_CONFIG[foodType];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

/* ---------- Category Badge ---------- */

export function CategoryBadge({
  name,
}: {
  name: string;
}) {
  return (
    <span className="inline-flex w-fit items-center rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
      {name}
    </span>
  );
}

/* ---------- Availability Badge ---------- */

export function AvailabilityBadge({
  isAvailable,
}: {
  isAvailable: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-200",
        isAvailable
          ? "bg-emerald-100 text-emerald-700"
          : "bg-stone-200 text-stone-600"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isAvailable ? "bg-emerald-500" : "bg-stone-400"
        )}
      />
      {isAvailable ? "Available" : "Unavailable"}
    </span>
  );
}

/* ---------- Availability Toggle ---------- */

export function AvailabilityToggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={
        label ??
        (checked
          ? "Mark item as unavailable"
          : "Mark item as available")
      }
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-emerald-500" : "bg-stone-300"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

/* ---------- Image Placeholder ---------- */

export function MenuItemImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 shadow-inner">
        <UtensilsCrossed className="h-6 w-6 text-amber-500" />
      </div>
    </div>
  );
}

/* ---------- Empty State ---------- */

export function MenuEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
        <Icon className="h-6 w-6 text-stone-400" />
      </div>

      <p className="mt-4 font-semibold text-stone-900">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-sm text-stone-500">
        {description}
      </p>

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}