"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3,
  Coffee,
  LayoutGrid,
  Package2,
  Settings,
  ShoppingBag,
  Table2,
} from "lucide-react";

import { DashboardNavItem } from "@/components/dashboard/dashboard-nav-item";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/menu", label: "Menu", icon: Coffee },
  { href: "/dashboard/tables", label: "Tables", icon: Table2 },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package2 },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

type DashboardSidebarProps = {
  mobile?: boolean;
};

export function DashboardSidebar({
  mobile = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-72 shrink-0 border-r border-stone-200 bg-stone-50/80 flex flex-col justify-between",
        !mobile && "hidden lg:flex"
      )}
    >
      <div className="p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-600 text-white">
            <Coffee className="h-5 w-5" />
          </div>

          <div>
            <p className="text-lg font-semibold tracking-tight text-stone-900">
              CafeOS
            </p>
            <p className="text-sm text-stone-500">Operations</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <DashboardNavItem
                key={item.href}
                {...item}
                active={active}
              />
            );
          })}
        </nav>
      </div>

      <div className="border-t border-stone-200 p-6 text-sm text-stone-500">
        <p className="font-medium text-stone-700">
          Shift status
        </p>
        <p className="mt-1">
          All systems operational
        </p>
      </div>
    </aside>
  );
}