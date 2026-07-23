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
      {/*
        Mobile fixes:
        - max-h + flex column so the dialog itself never exceeds the
          viewport, with only the middle section scrolling.
        - w-[calc(100%-2rem)] so it doesn't touch the screen edges on
          narrow phones (default shadcn dialog is full-width on mobile).
        - Reduced padding at the base breakpoint, restored at sm:.
      */}
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-xl flex-col gap-0 p-0 sm:w-full">
        <DialogHeader className="shrink-0 border-b border-stone-100 px-5 pb-4 pt-5 sm:px-6">
          <DialogTitle className="text-base sm:text-lg">
            Order #{order.id.slice(-6).toUpperCase()}
          </DialogTitle>

          <DialogDescription>{formatDate(order.createdAt)}</DialogDescription>
        </DialogHeader>

        {/* Scrollable middle: everything except the header and the
            sticky action bar at the bottom. This is what stops long
            item lists from pushing the "Mark as X" button off-screen. */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Table2 className="h-5 w-5 shrink-0 text-stone-500" />
              <span className="text-sm sm:text-base">{order.table.name}</span>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Phone className="h-4 w-4 shrink-0" />
            <span className="break-all">
              {order.customerPhone || "Customer phone not provided"}
            </span>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <h3 className="font-semibold">Ordered Items</h3>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 border-b border-stone-100 pb-2"
                >
                  <div className="min-w-0">
                   <p className="break-words font-medium">
                      {item.menuItem.name}
                    </p>
                    <p className="text-sm text-stone-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-stone-100 pt-4">
            <p className="text-base font-semibold sm:text-lg">Total</p>
            <p className="text-lg font-bold text-amber-600 sm:text-xl">
              {formatPrice(order.total)}
            </p>
          </div>
        </div>

        {/* Sticky action bar — always visible, never scrolls away, and
            tall enough (h-12 = 48px) to be a comfortable thumb target. */}
        <div className="shrink-0 border-t border-stone-100 px-5 py-4 sm:px-6">
          {nextStatus ? (
            <Button
              disabled={updating}
              className="h-12 w-full text-base"
              onClick={() => onStatusUpdate(nextStatus)}
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
              {STATUS_LABELS[order.status].toLowerCase()}.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}