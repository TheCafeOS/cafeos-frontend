import NotificationItem from "./NotificationItem";

import type { Notification } from "@/types/notification";

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
      <div className="w-96 p-4 text-center text-sm text-stone-500">
        Loading notifications...
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