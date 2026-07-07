"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  getOrders,
  updateOrderStatus,
} from "@/services/order.service";
import type { OrderStatus, RestaurantOrder } from "@/types/order";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function formatPrice(price: number | string): string {
  const numericPrice = Number(price);

  return Number.isFinite(numericPrice)
    ? `₹${numericPrice.toFixed(2)}`
    : "₹0.00";
}

function formatOrderReference(orderId: string): string {
  return `#${orderId.slice(-6).toUpperCase()}`;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setIsLoading(true);
      setError("");

      const data = await getOrders();
      setOrders(data.orders);
    } catch (caughtError) {
      const message = getErrorMessage(caughtError);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusUpdate(
    orderId: string,
    nextStatus: OrderStatus,
  ) {
    try {
      setUpdatingOrderId(orderId);

      const updatedOrder = await updateOrderStatus(orderId, {
        status: nextStatus,
      });

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      );

      toast.success(
        `Order ${formatOrderReference(updatedOrder.id)} marked as ${STATUS_LABELS[nextStatus]}.`,
      );
    } catch (caughtError) {
      toast.error(getErrorMessage(caughtError));
    } finally {
      setUpdatingOrderId(null);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <DashboardShell
      title="Orders"
      description="Review incoming customer orders for your restaurant."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">
              Recent orders
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Newest orders appear first.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => void loadOrders()}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center rounded-lg border border-stone-200 bg-stone-50 py-12">
            <Loader2 className="h-6 w-6 animate-spin text-stone-600" />
          </div>
        ) : null}

        {error && !isLoading ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>

            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={() => void loadOrders()}
            >
              Try Again
            </Button>
          </div>
        ) : null}

        {!isLoading && !error && orders.length === 0 ? (
          <div className="rounded-lg border border-stone-200 bg-stone-50 py-12 text-center text-stone-600">
            No orders have been placed yet.
          </div>
        ) : null}

        {!isLoading && !error && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const nextStatus = NEXT_STATUS[order.status];
              const isUpdating = updatingOrderId === order.id;

              return (
                <article
                  key={order.id}
                  className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {formatOrderReference(order.id)}
                      </p>
                      <p className="mt-1 text-sm text-stone-600">
                        {order.table.name} · {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-stone-100 pt-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="text-stone-700">
                          {item.menuItem.name} × {item.quantity}
                        </span>
                        <span className="font-medium text-stone-900">
                          {formatPrice(Number(item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                    <p className="text-sm text-stone-600">
                      Phone: {order.customerPhone || "Not provided"}
                    </p>

                    <p className="font-semibold text-stone-900">
                      Total: {formatPrice(order.total)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                    {nextStatus ? (
                      <Button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          void handleStatusUpdate(order.id, nextStatus)
                        }
                      >
                        {isUpdating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Mark as {STATUS_LABELS[nextStatus]}
                      </Button>
                    ) : (
                      <p className="text-sm font-medium text-stone-500">
                        This order is {STATUS_LABELS[order.status].toLowerCase()}.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}