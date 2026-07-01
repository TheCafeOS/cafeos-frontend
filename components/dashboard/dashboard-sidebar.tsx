import {
  BarChart3,
  Coffee,
  LayoutGrid,
  Package2,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { DashboardNavItem } from "@/components/dashboard/dashboard-nav-item";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid, active: true },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/menu", label: "Menu", icon: Coffee },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package2 },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-stone-200 bg-stone-50/80 lg:flex lg:flex-col lg:justify-between">
      <div className="p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-600 text-white">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-stone-900">CafeOS</p>
            <p className="text-sm text-stone-500">Operations</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <DashboardNavItem key={item.href} {...item} />
          ))}
        </nav>
      </div>

      <div className="border-t border-stone-200 p-6 text-sm text-stone-500">
        <p className="font-medium text-stone-700">Shift status</p>
        <p className="mt-1">All systems operational</p>
      </div>
    </aside>
  );
}
