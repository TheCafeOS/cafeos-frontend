"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getSocket } from "@/lib/socket";

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
      toast.success("🍽️ New Order Received", {
        description: `₹${payload.total} • ${payload.itemCount} item(s)`,
        action: {
          label: "View",
          onClick: () => {
            // If already on Orders page, open dialog instantly
            if (window.location.pathname === "/dashboard/orders") {
              window.dispatchEvent(
                new CustomEvent("open-order-dialog", {
                  detail: {
                    orderId: payload.orderId,
                  },
                }),
              );
            } else {
              // Otherwise navigate to Orders
              router.push("/dashboard/orders");
            }
          },
        },
      });
    };

    socket.on("ORDER_CREATED", handleOrderCreated);

    return () => {
      socket.off("ORDER_CREATED", handleOrderCreated);
    };
  }, [router]);

  return null;
}