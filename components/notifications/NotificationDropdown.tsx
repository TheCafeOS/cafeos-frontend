import NotificationItem from "./NotificationItem";

import type { Notification } from "@/types/notification";
import { Skeleton } from "@/components/ui/skeleton";

type NotificationDropdownProps = {
  notifications: Notification[];
  loading: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
};

export default function NotificationDropdown({
  notifications,
  loading,
  onNotificationClick,
  onMarkAllRead,
}: NotificationDropdownProps) {
  if (loading) {
    return (
      <div className="w-[560px]">
        <div className="border-b border-stone-200 px-5 py-4">
          <Skeleton className="h-6 w-40" />
        </div>

        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-stone-200 p-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-5">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>

              <Skeleton className="mt-4 h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasUnread = notifications.some(
    (notification) => !notification.isRead,
  );

  if (notifications.length === 0) {
    return (
      <div className="w-[560px] p-10 text-center">
        <div className="space-y-2">
          <p className="text-lg">🔔</p>

          <p className="font-medium text-stone-700">
         You&apos;re all caught up
          </p>

          <p className="text-sm text-stone-500">
            No new notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[560px]">
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-stone-900">
          Notifications
        </h2>

        <button
          type="button"
          className="text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
        >
          View all
        </button>
      </div>

      {hasUnread && onMarkAllRead && (
        <div className="flex justify-end border-b border-stone-100 px-5 py-2">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs font-medium text-stone-500 transition-colors hover:text-stone-900"
          >
            Mark all as read
          </button>
        </div>
      )}

  <div
  className="
   max-h-[calc(100vh-180px)]
    overflow-y-auto
    px-4
    pt-4
    pb-6
    pr-3
    space-y-3
    scrollbar-thin
    scrollbar-thumb-stone-300
    scrollbar-track-transparent
  "
>

        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => onNotificationClick?.(notification)}
          />
        ))}
      </div>
    </div>
  );
}