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
      <div className="w-[500px] overflow-hidden p-5">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
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
      <div className="w-[560px] p-10 text-center text-sm text-stone-500">
        No notifications found.
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
          className="text-sm font-medium text-amber-600 transition hover:text-amber-700"
        >
          View all
        </button>
      </div>

      {hasUnread && onMarkAllRead && (
        <div className="flex justify-end border-b border-stone-100 px-5 py-2">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs font-medium text-stone-500 transition hover:text-stone-900"
          >
            Mark all as read
          </button>
        </div>
      )}

      <div className="max-h-[560px] space-y-2 overflow-y-auto p-4">
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