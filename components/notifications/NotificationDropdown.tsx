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
    <div className="w-96 overflow-hidden p-4">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-32 max-w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

  const hasUnread = notifications.some((notification) => !notification.isRead);

  if (notifications.length === 0) {
    return (
      <div className="w-96 p-6 text-center text-sm text-stone-500">
        No notifications found.
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {hasUnread && onMarkAllRead ? (
        <div className="flex justify-end px-3 pb-2">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Mark all as read
          </button>
        </div>
      ) : null}
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={() => onNotificationClick?.(notification)}
        />
      ))}
    </div>
  );
}