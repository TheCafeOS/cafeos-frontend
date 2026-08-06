"use client";

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
        title: "New Order Received",
        accent: "border-l-blue-500",
        amount: "text-stone-900",
        button:
          "border-blue-300 text-blue-600 hover:bg-blue-50",
      };

    case "ORDER_STATUS":
      switch (notification.data.status) {
        case "PREPARING":
          return {
            title: "Order Preparing",
            accent: "border-l-amber-500",
           amount: "text-stone-900",
            button:
              "border-amber-300 text-amber-600 hover:bg-amber-50",
          };

        case "COMPLETED":
          return {
            title: "Order Completed",
            accent: "border-l-emerald-500",
            amount: "text-stone-900",
            button:
  "border-stone-300 text-stone-700 hover:bg-stone-50",
          };

        case "CANCELLED":
          return {
            title: "Order Cancelled",
            accent: "border-l-stone-300",
            amount: "text-stone-600",
            button:
              "border-stone-300 text-stone-600 hover:bg-stone-50",
          };

        default:
          return {
            title: "Order Updated",
            accent: "border-l-stone-400",
            amount: "text-stone-600",
            button:
              "border-stone-300 text-stone-600 hover:bg-stone-50",
          };
      }

    case "LOYALTY_REWARD":
      return {
        title: "Loyalty Reward",
        accent: "border-l-violet-500",
        amount: "text-violet-600",
        button:
          "border-violet-300 text-violet-600 hover:bg-violet-50",
      };

    default:
      return {
        title: notification.title,
        accent: "border-l-stone-400",
        amount: "text-stone-600",
        button:
          "border-stone-300 text-stone-600 hover:bg-stone-50",
      };
  }
}

export default function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  useRelativeTime();

  const style = getNotificationStyle(notification);
if (notification.type === "LOYALTY_REWARD") {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        relative
        w-full
        rounded-xl
        border
        border-stone-200
        border-l-4
        border-l-violet-500
        bg-white
        px-4
        py-3
        text-left
        transition-all
        duration-300
        ease-out
        hover:-translate-y-[2px]
        hover:border-stone-300
        hover:shadow-lg
      "
    >
      {!notification.isRead && (
        <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-orange-500" />
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-stone-900">
          🎉 Loyalty Reward
        </h3>

        <span className="rounded-lg border border-violet-300 px-2.5 py-1 text-[11px] font-medium text-violet-600">
          Reward
        </span>
      </div>

      <p className="mt-3 text-sm text-stone-600">
        {notification.message}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-5">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-stone-400">
            Reward
          </p>

          <p className="mt-1 text-[16px] font-semibold text-stone-900">
            {notification.data.rewardName ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider text-stone-400">
            Order ID
          </p>

          <p className="mt-1 text-[16px] font-semibold text-stone-900">
            {notification.data.orderId
              ? `#${notification.data.orderId
                  .slice(-6)
                  .toUpperCase()}`
              : "-"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center text-xs text-stone-500">
        <span>
          {notification.data.rewardCount ?? 1} Reward
          {" • "}
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>
    </button>
  );
}

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        w-full
        rounded-xl
        border
        border-stone-200
        border-l-4
        ${style.accent}
        bg-white
        px-4
        py-1
        text-left
        transition-all
      duration-300 ease-out
        hover:-translate-y-[2px]
hover:border-stone-300
hover:shadow-lg
      `}
    >
      {!notification.isRead && (
        <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-orange-500" />
      )}

      {/* Header */}
<div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-stone-900">
          {style.title}
        </h3>

        {notification.data.orderId && (
          <span
            className={`
              rounded-lg
              border
  px-2.5
py-1
text-[11px]
              font-medium
          transition-all duration-200
              ${style.button}
            `}
          >
            View Order
          </span>
        )}
      </div>

      {/* Information */}
<div className="mt-3 grid grid-cols-3 gap-5">
          <div>
          <p className="text-[11px] uppercase tracking-wider text-stone-400">
            Table
          </p>

          <p className="mt-1 text-[16px] font-semibold text-stone-900">
            {notification.data.tableName ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider text-stone-400">
            Order ID
          </p>

          <p className="mt-1 text-base font-semibold text-stone-900">
            {notification.data.orderId
              ? `#${notification.data.orderId
                  .slice(-6)
                  .toUpperCase()}`
              : "-"}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider text-stone-400">
            Amount
          </p>

          <p className={`mt-1 text-lg font-bold ${style.amount}`}>
            {notification.data.total
              ? `₹${notification.data.total}`
              : "-"}
          </p>
        </div>
      </div>

      {/* Footer */}
<div className="mt-3 flex items-center text-xs text-stone-500">
            <span>
          {notification.data.itemCount
            ? `${notification.data.itemCount} ${
                notification.data.itemCount === 1
                  ? "item"
                  : "items"
              } • `
            : ""}
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>
    </button>
  );
}