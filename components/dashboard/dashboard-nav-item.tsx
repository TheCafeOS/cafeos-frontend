import Link from "next/link";

import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

type DashboardNavItemProps = {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
};

export function DashboardNavItem({
  icon: Icon,
  label,
  href,
  active,
  badge,
}: DashboardNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-amber-100 text-amber-800"
          : badge
            ? "text-stone-400 hover:bg-stone-100 hover:text-stone-500"
            : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />

      <span className="flex-1">{label}</span>

      {badge ? (
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}