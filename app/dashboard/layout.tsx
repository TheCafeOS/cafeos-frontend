"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { RestaurantBrandingProvider } from "@/providers/restaurant-branding-provider";

import { connectSocket } from "@/lib/socket";
import OwnerSocketListener from "@/components/socket/owner-socket-listener";

import { getEmployee } from "@/utils/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname)}`
      );
      return;
    }

    const employee = getEmployee();

    if (!employee) {
      router.replace("/login");
      return;
    }

    // STAFF restrictions
    if (employee.role === "STAFF") {
      const restrictedRoutes = [
        "/dashboard",
        "/dashboard/inventory",
        "/dashboard/reports",
        "/dashboard/settings",
        "/dashboard/employees",
      ];

      if (restrictedRoutes.includes(pathname)) {
        router.replace("/dashboard/orders");
        return;
      }
    }

    // MANAGER restrictions
    if (employee.role === "MANAGER") {
      const restrictedRoutes = [
        "/dashboard/settings",
        "/dashboard/employees",
      ];

      if (restrictedRoutes.includes(pathname)) {
        router.replace("/dashboard");
        return;
      }
    }

    connectSocket();
  }, [pathname, router]);

  return (
    <div suppressHydrationWarning>
      <RestaurantBrandingProvider>
        <OwnerSocketListener />
        {children}
      </RestaurantBrandingProvider>
    </div>
  );
}