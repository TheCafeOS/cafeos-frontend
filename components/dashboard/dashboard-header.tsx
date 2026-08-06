"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter, usePathname } from "next/navigation";
import { Bell, LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { clearAuth } from "@/utils/auth";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { useOrderDialogStore } from "@/lib/order-dialog-store";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification.service";
import type { Notification } from "@/types/notification";

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
  const setSelectedOrderId = useOrderDialogStore(
  (state) => state.setSelectedOrderId,
);
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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
    console.log("Unread API returned:", count);

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

  useEffect(() => {
    if (!isPopoverOpen) {
      return;
    }

    let isMounted = true;

    async function loadNotifications() {
      if (!isMounted) {
        return;
      }

      setLoadingNotifications(true);

      try {
        const response = await getNotifications();

        if (isMounted) {
          setNotifications(response.data);
        }
      } catch {
        if (isMounted) {
          setNotifications([]);
        }
      } finally {
        if (isMounted) {
          setLoadingNotifications(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [isPopoverOpen]);

  
const handleNotificationClick = async (
  notification: Notification,
) => {
 console.log(
  "Clicked notification:",
  JSON.stringify(notification, null, 2),
);
  try {
    const updatedNotification = await markNotificationRead(
      notification.id,
    );

    setNotifications((currentNotifications) =>
      currentNotifications.map((item) =>
        item.id === updatedNotification.id
          ? {
              ...item,
              isRead: updatedNotification.isRead,
            }
          : item,
      ),
    );

    if (!notification.isRead) {
      setUnreadCount((count) => Math.max(0, count - 1));
    }

    // Close dropdown
    setIsPopoverOpen(false);

    // Only for order notifications
   const orderId = notification.data?.orderId;

if (orderId) {
  setSelectedOrderId(orderId);

  router.push("/dashboard/orders");
}
  } catch {
    // Leave UI unchanged on failure.
  }
};

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.isRead ? notification : { ...notification, isRead: true },
        ),
      );
      setUnreadCount(0);
    } catch {
      // Leave UI unchanged on failure.
    }
  };

const handleRealtimeNotification = useCallback(
  (event: Event) => {
    console.log("🔥 Dashboard received realtime notification");

    const customEvent = event as CustomEvent<Notification>;
    const notification = customEvent.detail;

    console.log("Payload:", notification);

    if (!notification) {
      return;
    }

    setNotifications((currentNotifications) => {
      console.log(
        "Current notifications:",
        currentNotifications.length,
      );

      if (
        currentNotifications.some(
          (item) => item.id === notification.id,
        )
      ) {
        console.log("Duplicate notification");
        return currentNotifications;
      }

      console.log("Adding notification");

      return [notification, ...currentNotifications];
    });

    setUnreadCount((count) => {
      console.log("Unread:", count, "->", count + 1);
      return count + 1;
    });
  },
  [],
);


useEffect(() => {
  window.addEventListener(
    "notification-created",
    handleRealtimeNotification,
  );

  return () => {
    window.removeEventListener(
      "notification-created",
      handleRealtimeNotification,
    );
  };
}, [handleRealtimeNotification]);


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
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
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
          </PopoverTrigger>

<PopoverContent
  align="end"
  sideOffset={8}
  className="w-96 p-0 overflow-hidden"
>
              <NotificationDropdown
              notifications={notifications}
              loading={loadingNotifications}
              onNotificationClick={handleNotificationClick}
              onMarkAllRead={handleMarkAllRead}
            />
          </PopoverContent>
        </Popover>

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