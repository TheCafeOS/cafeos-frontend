"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clearAuth } from "@/utils/auth";
import { getUnreadCount } from "@/services/notification.service";

type DashboardHeaderProps = {
  title: string;
  description?: string;
  onMenuClick?: () => void;
};

export function DashboardHeader({
  title,
  description,
  onMenuClick,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const showLogout =
    pathname === "/dashboard" ||
    pathname === "/dashboard/settings";

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  useEffect(() => {
    let isMounted = true;

    void getUnreadCount()
      .then((count) => {
        if (isMounted) {
          setUnreadCount(count);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUnreadCount(0);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-xl font-semibold tracking-tight text-stone-900">
            {title}
          </h1>

          {description ? (
            <p className="text-sm text-stone-500">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold leading-none text-white">
              {unreadCount}
            </span>
          ) : null}
        </Button>

        {showLogout && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Logout"
            title="Logout"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}