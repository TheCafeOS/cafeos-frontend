import NotificationItem from "./NotificationItem";

import type { Notification } from "@/types/notification";

type NotificationDropdownProps = {
  notifications: Notification[];
  loading: boolean;
  onNotificationClick?: (notification: Notification) => void;
};

export default function NotificationDropdown({
  notifications,
  loading,
  onNotificationClick,
}: NotificationDropdownProps) {
  if (loading) {
    return (
      <div className="w-96 p-4 text-center text-sm text-stone-500">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="w-96 p-6 text-center text-sm text-stone-500">
        No notifications found.
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
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