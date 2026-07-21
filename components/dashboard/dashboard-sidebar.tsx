"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Coffee,
  LayoutGrid,
  Package2,
  Settings,
  ShoppingBag,
  Table2,
  Users,
} from "lucide-react";

import { DashboardNavItem } from "@/components/dashboard/dashboard-nav-item";
import { useRestaurantBranding } from "@/providers/restaurant-branding-provider";
import { getEmployee } from "@/utils/auth";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  mobile?: boolean;
};

export function DashboardSidebar({
  mobile = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { restaurant } = useRestaurantBranding();

  const employee = getEmployee();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutGrid },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
    { href: "/dashboard/menu", label: "Menu", icon: Coffee },
    { href: "/dashboard/tables", label: "Tables", icon: Table2 },
    { href: "/dashboard/inventory", label: "Inventory", icon: Package2 },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  if (employee?.role === "OWNER") {
    navItems.push({
      href: "/dashboard/employees",
      label: "Employees",
      icon: Users,
    });
  }

  return (
    <aside
      className={cn(
        "flex w-72 shrink-0 flex-col justify-between border-r border-stone-200 bg-stone-50/80",
        !mobile && "hidden lg:flex",
      )}
    >
      <div className="p-6">
        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            {restaurant?.logoUrl ? (
              <Image
                src={restaurant.logoUrl}
                alt={restaurant.name}
                fill
                sizes="56px"
                className="object-contain p-1"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-amber-600 text-white">
                <Coffee className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-bold tracking-tight text-stone-900">
              {restaurant?.name || "CafeOS"}
            </p>

            <p className="truncate text-sm text-stone-500">
              {restaurant?.tagline || "Restaurant Management"}
            </p>
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