"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Coffee,
  Gift,
  LayoutGrid,
  Package2,
  Settings,
  ShoppingBag,
  Table2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

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

  const [employee, setEmployee] = useState<ReturnType<typeof getEmployee>>(
    null,
  );

  useEffect(() => {
    const id = setTimeout(() => {
      setEmployee(getEmployee());
    }, 0);

    return () => clearTimeout(id);
  }, []);

  const navItems =
    employee?.role === "OWNER"
      ? [
          {
            href: "/dashboard",
            label: "Dashboard",
            icon: LayoutGrid,
          },
          {
            href: "/dashboard/orders",
            label: "Orders",
            icon: ShoppingBag,
          },
          {
            href: "/dashboard/menu",
            label: "Menu",
            icon: Coffee,
          },
          {
            href: "/dashboard/tables",
            label: "Tables",
            icon: Table2,
          },
          {
            href: "/dashboard/employees",
            label: "Employees",
            icon: Users,
          },
          {
            href: "/dashboard/loyalty",
            label: "Loyalty",
            icon: Gift,
          },
          {
            href: "/dashboard/settings",
            label: "Settings",
            icon: Settings,
          },
          {
            href: "/dashboard/inventory",
            label: "Inventory",
            icon: Package2,
            badge: "Soon",
          },
          {
            href: "/dashboard/reports",
            label: "Reports",
            icon: BarChart3,
            badge: "Soon",
          },
        ]
      : employee?.role === "MANAGER"
        ? [
            {
              href: "/dashboard",
              label: "Dashboard",
              icon: LayoutGrid,
            },
            {
              href: "/dashboard/orders",
              label: "Orders",
              icon: ShoppingBag,
            },
            {
              href: "/dashboard/menu",
              label: "Menu",
              icon: Coffee,
            },
            {
              href: "/dashboard/tables",
              label: "Tables",
              icon: Table2,
            },
            {
              href: "/dashboard/inventory",
              label: "Inventory",
              icon: Package2,
              badge: "Soon",
            },
            {
              href: "/dashboard/reports",
              label: "Reports",
              icon: BarChart3,
              badge: "Soon",
            },
          ]
        : [
            {
              href: "/dashboard/orders",
              label: "Orders",
              icon: ShoppingBag,
            },
            {
              href: "/dashboard/menu",
              label: "Menu",
              icon: Coffee,
            },
            {
              href: "/dashboard/tables",
              label: "Tables",
              icon: Table2,
            },
          ];

  return (
    <aside
      className={cn(
        "flex h-full min-h-screen w-72 shrink-0 flex-col justify-between overflow-y-auto border-r border-stone-200 bg-stone-50",
        !mobile && "hidden lg:flex",
      )}
    >
      <div className="flex min-h-full flex-col">
        <div className="px-5 pt-8">
          <div className="flex items-center gap-4">
            {restaurant?.logoUrl ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <Image
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-lg font-semibold text-stone-700 shadow-sm">
                {restaurant?.name?.charAt(0) ?? "C"}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-xl font-semibold leading-tight text-stone-900">
                {restaurant?.name ?? "CafeOS"}
              </h1>

              {restaurant?.tagline ? (
                <p className="mt-1 text-sm leading-5 text-stone-500">
                  {restaurant.tagline}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 px-5 pt-10">
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
      </div>
    </aside>
  );
}