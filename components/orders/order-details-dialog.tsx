"use client";

import { Loader2, Phone, ShoppingBag, Table2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { OrderStatus, RestaurantOrder } from "@/types/order";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sky-100 text-sky-800",
  PREPARING: "bg-violet-100 text-violet-800",
  READY: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-stone-200 text-stone-700",
  CANCELLED: "bg-red-100 text-red-800",
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};

function formatPrice(price: number | string) {
  return `₹${Number(price).toFixed(2)}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

type Props = {
  open: boolean;
  order: RestaurantOrder | null;
  updating: boolean;
  onClose: () => void;
  onStatusUpdate: (status: OrderStatus) => void;
};

export function OrderDetailsDialog({
  open,
  order,
  updating,
  onClose,
  onStatusUpdate,
}: Props) {
  if (!order) return null;

  const nextStatus = NEXT_STATUS[order.status];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">

        <DialogHeader>
          <DialogTitle>
            Order #{order.id.slice(-6).toUpperCase()}
          </DialogTitle>

          <DialogDescription>
            {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <Table2 className="h-5 w-5 text-stone-500" />

              <span>{order.table.name}</span>

            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
            >
              {STATUS_LABELS[order.status]}
            </span>

          </div>

          <div className="flex items-center gap-2 text-sm text-stone-600">

            <Phone className="h-4 w-4" />

            {order.customerPhone || "Customer phone not provided"}

          </div>

          <div>

            <div className="mb-3 flex items-center gap-2">

              <ShoppingBag className="h-4 w-4" />

              <h3 className="font-semibold">
                Ordered Items
              </h3>

            </div>

            <div className="space-y-3">

              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>

                    <p className="font-medium">
                      {item.menuItem.name}
                    </p>

                    <p className="text-sm text-stone-500">
                      Qty: {item.quantity}
                    </p>

                  </div>

                  <p className="font-semibold">
                    {formatPrice(
                      Number(item.price) * item.quantity,
                    )}
                  </p>

                </div>
              ))}

            </div>

          </div>

          <div className="flex items-center justify-between border-t pt-4">

            <p className="text-lg font-semibold">
              Total
            </p>

            <p className="text-xl font-bold text-amber-600">
              {formatPrice(order.total)}
            </p>

          </div>

          <div className="border-t pt-4">

            {nextStatus ? (
              <Button
                disabled={updating}
                className="w-full"
                onClick={() =>
                  onStatusUpdate(nextStatus)
                }
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>Mark as {STATUS_LABELS[nextStatus]}</>
                )}
              </Button>
            ) : (
              <p className="text-center text-sm text-stone-500">
                This order is already{" "}
                {STATUS_LABELS[
                  order.status
                ].toLowerCase()}.
              </p>
            )}

          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}