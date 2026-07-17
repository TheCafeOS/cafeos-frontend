import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type DashboardNavItemProps = {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
};

export function DashboardNavItem({ icon: Icon, label, href, active }: DashboardNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-amber-100 text-amber-800"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
