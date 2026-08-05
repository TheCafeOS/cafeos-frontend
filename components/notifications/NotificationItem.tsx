import { Bell } from "lucide-react";

import type { Notification } from "@/types/notification";

type NotificationItemProps = {
  notification: Notification;
  onClick?: () => void;
};

export default function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border-b border-stone-100 p-4 text-left transition hover:bg-stone-50 ${
        !notification.isRead ? "bg-orange-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-orange-100 p-2">
          <Bell className="h-4 w-4 text-orange-600" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate text-sm font-semibold text-stone-900">
              {notification.title}
            </h4>

            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-orange-500" />
            )}
          </div>

          <p className="mt-1 text-sm text-stone-600">
            {notification.message}
          </p>

          <p className="mt-2 text-xs text-stone-400">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </button>
  );
}