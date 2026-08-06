"use client";

import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Gift,
  ShoppingBag,
  XCircle,
} from "lucide-react";

import { formatRelativeTime } from "@/lib/utils";
import { useRelativeTime } from "@/hooks/use-relative-time";

import type { Notification } from "@/types/notification";

type NotificationItemProps = {
  notification: Notification;
  onClick?: () => void;
};

function getNotificationStyle(notification: Notification) {
  switch (notification.type) {
    case "NEW_ORDER":
      return {
        icon: ShoppingBag,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        border: "border-l-orange-500",
      };

    case "ORDER_STATUS":
      if (notification.data.status === "CANCELLED") {
        return {
          icon: XCircle,
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          border: "border-l-red-500",
        };
      }

      return {
        icon: CheckCircle2,
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        border: "border-l-emerald-500",
      };

    case "LOYALTY_REWARD":
      return {
        icon: Gift,
        iconBg: "bg-violet-100",
        iconColor: "text-violet-600",
        border: "border-l-violet-500",
      };

    default:
      return {
        icon: Bell,
        iconBg: "bg-stone-100",
        iconColor: "text-stone-600",
        border: "border-l-stone-400",
      };
  }
}

export default function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  useRelativeTime();

  const style = getNotificationStyle(notification);
  const Icon = style.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        w-full
        border-b
        border-stone-100
        border-l-4
        ${style.border}
        bg-white
        px-5
        py-4
        text-left
        transition-all
        duration-200
        hover:bg-stone-50
        hover:shadow-sm
        ${
          !notification.isRead
            ? "bg-orange-50/40"
            : ""
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div
          className={`
            mt-0.5
            rounded-xl
            p-2.5
            ${style.iconBg}
          `}
        >
          <Icon
            className={`h-5 w-5 ${style.iconColor}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-stone-900">
                {notification.title}
              </h4>

              <p className="mt-1 text-sm leading-6 text-stone-600">
                {notification.message}
              </p>
            </div>

            {!notification.isRead && (
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />
            )}
          </div>

          {notification.data.tableName && (
            <div className="mt-3 inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
              {notification.data.tableName}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-stone-400">
              {formatRelativeTime(notification.createdAt)}
            </span>

            {notification.data.orderId && (
              <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 opacity-0 transition-opacity group-hover:opacity-100">
                View Order
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}