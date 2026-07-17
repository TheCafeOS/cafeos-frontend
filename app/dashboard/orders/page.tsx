"use client";

import { useCallback, useEffect, useMemo, useState } from "react";import { Loader2, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { getOrders, updateOrderStatus } from "@/services/order.service";
import type { OrderStatus, RestaurantOrder } from "@/types/order";
import { useOwnerOrderSocket } from "@/hooks/use-owner-order-socket";
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog";


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

const STATUS_FILTERS: Array<{
  label: string;
  value: OrderStatus | "ALL";
}> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sky-100 text-sky-800",
  PREPARING: "bg-violet-100 text-violet-800",
  READY: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-stone-200 text-stone-700",
  CANCELLED: "bg-red-100 text-red-800",
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
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] =
  useState<RestaurantOrder | null>(null);

const [dialogOpen, setDialogOpen] =
  useState(false);

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
if (selectedOrder?.id === updatedOrder.id) {
  setSelectedOrder(updatedOrder);
}
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

const handleOrderCreated = useCallback(() => {
  void loadOrders();
}, []);

const handleOrderUpdated = useCallback(() => {
  void loadOrders();
}, []);

useOwnerOrderSocket({
  onOrderCreated: handleOrderCreated,
  onOrderUpdated: handleOrderUpdated,
});
useEffect(() => {
  const handleOpenOrderDialog = (
    event: Event,
  ) => {
    const customEvent = event as CustomEvent<{
      orderId: string;
    }>;

    const order = orders.find(
      (item) => item.id === customEvent.detail.orderId,
    );

    if (!order) {
      return;
    }

    setSelectedOrder(order);
    setDialogOpen(true);
  };

  window.addEventListener(
    "open-order-dialog",
    handleOpenOrderDialog,
  );

  return () => {
    window.removeEventListener(
      "open-order-dialog",
      handleOpenOrderDialog,
    );
  };
}, [orders]);
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        order.id,
        formatOrderReference(order.id),
        order.table.name,
        order.customerPhone ?? "",
        ...order.items.map((item) => item.menuItem.name),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [orders, searchQuery, statusFilter]);

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
              {filteredOrders.length} of {orders.length} order
              {orders.length === 1 ? "" : "s"} shown.
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

        {!isLoading && !error ? (
          <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by order ID, table, phone, or item..."
                className="w-full rounded-lg border border-stone-200 py-2 pl-10 pr-10 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {STATUS_FILTERS.map((filter) => (
                <Button
                  key={filter.value}
                  type="button"
                  size="sm"
                  variant={
                    statusFilter === filter.value ? "default" : "outline"
                  }
                  className={
                    statusFilter === filter.value
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "shrink-0"
                  }
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

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

        {!isLoading && !error && orders.length > 0 && filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-stone-200 bg-stone-50 py-12 text-center">
            <p className="font-medium text-stone-800">No matching orders found.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              Clear filters
            </button>
          </div>
        ) : null}

        {!isLoading && !error && filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
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

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
                    >
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

  <Button
    variant="outline"
    onClick={() => {
      setSelectedOrder(order);
      setDialogOpen(true);
    }}
  >
    View Details
  </Button>

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
      <OrderDetailsDialog
  open={dialogOpen}
  order={selectedOrder}
  updating={
    selectedOrder !== null &&
    updatingOrderId === selectedOrder.id
  }
  onClose={() => {
    setDialogOpen(false);
    setSelectedOrder(null);
  }}
  onStatusUpdate={(status) => {
    if (!selectedOrder) return;

    void handleStatusUpdate(selectedOrder.id, status);
  }}
/>
    </DashboardShell>
  );
}