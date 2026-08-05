"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getSocket } from "@/lib/socket";
import type { Notification } from "@/types/notification";

type OrderCreatedPayload = {
  tableId: string;
  orderId: string;
  total: number;
  itemCount: number;
  status: string;
  timestamp: string;
};

export default function OwnerSocketListener() {
  const router = useRouter();

  useEffect(() => {
    const socket = getSocket();

    const handleOrderCreated = (payload: OrderCreatedPayload) => {
  console.log("✅ ORDER_CREATED RECEIVED", payload);

  toast.success("🍽️ New Order Received", {

        description: `₹${payload.total} • ${payload.itemCount} item(s)`,
        action: {
          label: "View",
          onClick: () => {
            if (window.location.pathname === "/dashboard/orders") {
              window.dispatchEvent(
                new CustomEvent("open-order-dialog", {
                  detail: {
                    orderId: payload.orderId,
                  },
                }),
              );
            } else {
              router.push("/dashboard/orders");
            }
          },
        },
      });
    };

   const handleNotificationCreated = (payload: Notification) => {
  console.log("✅ NOTIFICATION_CREATED RECEIVED", payload);

  window.dispatchEvent(
        new CustomEvent("notification-created", {
          detail: payload,
        }),
      );
    };

    socket.on("ORDER_CREATED", handleOrderCreated);
    socket.on("NOTIFICATION_CREATED", handleNotificationCreated);

    return () => {
      socket.off("ORDER_CREATED", handleOrderCreated);
      socket.off("NOTIFICATION_CREATED", handleNotificationCreated);
    };
  }, [router]);

  return null;
}