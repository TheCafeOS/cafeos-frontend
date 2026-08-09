"use client";

import { useCallback, useEffect, useState } from "react";

import { useRelativeTime } from "@/hooks/use-relative-time";
import { Loader2, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "@/services/order.service";
import type { OrderStatus, RestaurantOrder } from "@/types/order";
import { useOwnerOrderSocket } from "@/hooks/use-owner-order-socket";
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog";
import { useOrderDialogStore } from "@/lib/order-dialog-store";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Accepted",
  PREPARING: "Preparing",
  COMPLETED: "Delivered",
  CANCELLED: "Cancelled",
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "COMPLETED",
};

const STATUS_FILTERS: Array<{
  label: string;
  value: OrderStatus | "ALL";
}> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Delivered", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:
    "border border-amber-200 bg-amber-50 text-amber-700",

  CONFIRMED:
    "border border-sky-200 bg-sky-50 text-sky-700",

  PREPARING:
    "border border-violet-200 bg-violet-50 text-violet-700",

  COMPLETED:
    "border border-emerald-200 bg-emerald-50 text-emerald-700",

  CANCELLED:
    "border border-red-200 bg-red-50 text-red-700",
};
const ACTION_BUTTON_STYLES: Partial<Record<OrderStatus, string>> = {
  PENDING:
    "bg-amber-600 hover:bg-amber-700 text-white",

  CONFIRMED:
    "bg-sky-600 hover:bg-sky-700 text-white",

  PREPARING:
    "bg-emerald-600 hover:bg-emerald-700 text-white",
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


export default function OrdersPage() {
  useRelativeTime();

  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
const limit = 10;

const [pagination, setPagination] = useState({
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
});

const [tableFilter] = useState("");
const [fromDate] = useState("");
const [toDate] = useState("");
const [sort] = useState<
  "createdAt" | "status" | "total"
>("createdAt");

const [order] = useState<"asc" | "desc">("desc");
const [, setSelectedOrderIdLocal] =
  useState<string | null>(null);
  
const [selectedOrder, setSelectedOrder] =
  useState<RestaurantOrder | null>(null);
const [dialogOpen, setDialogOpen] = useState(false);

const [highlightedOrderId, setHighlightedOrderId] =
  useState<string | null>(null);

const selectedOrderId = useOrderDialogStore(
  (state) => state.selectedOrderId,
);

const clearSelectedOrderId = useOrderDialogStore(
  (state) => state.clearSelectedOrderId,
);

const loadOrders = useCallback(async () => {
  try {
    setIsLoading(true);
    setError("");

    const response = await getOrders({
      page,
      limit,
      search: searchQuery || undefined,
      status:
        statusFilter === "ALL"
          ? undefined
          : statusFilter,
      tableId: tableFilter || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      sort,
      order,
    });

    setOrders(response.orders);
    setPagination(response.pagination);
  } catch (caughtError) {
    const message = getErrorMessage(caughtError);
    setError(message);
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
}, [
  page,
  limit,
  searchQuery,
  statusFilter,
  tableFilter,
  fromDate,
  toDate,
  sort,
  order,
]);
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
  setSelectedOrderIdLocal(updatedOrder.id);
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
  }, 400);

  return () => {
    window.clearTimeout(timer);
  };
}, [loadOrders]);

const handleOrderCreated = useCallback(() => {
  void loadOrders();
}, [loadOrders]);

const handleOrderUpdated = useCallback(() => {
  void loadOrders();
}, [loadOrders]);

useOwnerOrderSocket({
  onOrderCreated: handleOrderCreated,
  onOrderUpdated: handleOrderUpdated,
});


useEffect(() => {
  if (!selectedOrderId) {
    return;
  }

  async function openSelectedOrder() {
    try {
const orderId = selectedOrderId;

if (!orderId) return;

const fullOrder = await getOrderById(orderId);
      setSelectedOrder(fullOrder);
      setSelectedOrderIdLocal(fullOrder.id);

      const element = document.getElementById(
        `order-${fullOrder.id}`,
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      setHighlightedOrderId(fullOrder.id);

      setDialogOpen(true);

      setTimeout(() => {
        setHighlightedOrderId(null);
      }, 2500);
    } catch (error) {
      console.error(error);
      toast.error("Unable to open order.");
    } finally {
      clearSelectedOrderId();
    }
  }

  void openSelectedOrder();
}, [selectedOrderId, clearSelectedOrderId]);


useEffect(() => {
  async function handleOpenOrderDialog(
    event: Event,
  ) {
    const customEvent = event as CustomEvent<{
      orderId: string;
    }>;

    try {
      const fullOrder = await getOrderById(
        customEvent.detail.orderId,
      );

      setSelectedOrder(fullOrder);
      setSelectedOrderIdLocal(fullOrder.id);
      setDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Unable to open order.");
    }
  }

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
}, []);



  return (
    <DashboardShell title="Orders">
      <div className="w-full min-w-0 space-y-6 overflow-x-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">
              Recent orders
            </h2>
            <p className="mt-1 text-sm text-stone-600">
  {orders.length} of {pagination.totalItems} order
  {pagination.totalItems === 1 ? "" : "s"} shown.
</p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => void loadOrders()}
            className="h-10 sm:h-9"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {!isLoading && !error ? (
          <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-3.5 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
           <input
  type="text"
                value={searchQuery}
onChange={(event) => {
  setPage(1);
  setSearchQuery(event.target.value);
}}                placeholder="Search by order ID, table, phone, or item..."
                className="h-11 w-full rounded-lg border border-stone-200 py-2 pl-10 pr-10 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 sm:h-10"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
  setPage(1);
  setSearchQuery("");
}}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {/* Status filter chips: edge fade + scroll-snap so it's
                obvious there are more chips off-screen on narrow phones,
                instead of the row just getting clipped. */}
            <div className="relative">
              <div
className="flex snap-x snap-mandatory gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1"                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, black calc(100% - 24px), transparent 100%)",
                  maskImage:
                    "linear-gradient(to right, black calc(100% - 24px), transparent 100%)",
                }}
              >
                {STATUS_FILTERS.map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    size="sm"
                    variant={
                      statusFilter === filter.value ? "default" : "outline"
                    }
                  className={`h-9 shrink-0 snap-start rounded-lg border text-xs font-medium shadow-sm transition-all ${
  statusFilter === filter.value
    ? "border-amber-600 bg-amber-600 text-white hover:bg-amber-700 hover:border-amber-700"
    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
}`}
onClick={() => {
  setPage(1);
setStatusFilter(filter.value);}}                  >
                    {filter.label}
                  </Button>
                ))}
                <span className="shrink-0 w-2" aria-hidden="true" />
              </div>
            </div>
          </div>
        ) : null}

      {isLoading ? (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>

          <Skeleton className="h-7 w-24 rounded-full" />
        </div>

        <div className="mt-5 space-y-3 border-t border-stone-100 pt-5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>

        <div className="mt-5 flex gap-3 border-t border-stone-100 pt-5">
          <Skeleton className="h-11 flex-1 rounded-lg" />
          <Skeleton className="h-11 flex-1 rounded-lg" />
        </div>
      </div>
    ))}
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
           No matching orders
           Try another search or clear your filters.
          </div>
        ) : null}

       

       {!isLoading && !error && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const nextStatus = NEXT_STATUS[order.status];
              const isUpdating = updatingOrderId === order.id;

              return (
               <article
  id={`order-${order.id}`}
  key={order.id}
  className={`rounded-xl border bg-white p-4 shadow-sm transition-all duration-500 sm:p-5 ${
    highlightedOrderId === order.id
      ? "border-amber-500 ring-4 ring-amber-200 shadow-xl"
      : "border-stone-200"
  }`}
>

                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900">
                        {formatOrderReference(order.id)}
                      </p>
                      <p className="mt-1 text-sm text-stone-600">
{order.table.name} · {formatRelativeTime(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-stone-100 pt-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <span className="min-w-0 text-stone-700">
                          {item.menuItem.name} × {item.quantity}
                        </span>
                        <span className="shrink-0 font-medium text-stone-900">
                          {formatPrice(Number(item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

             <div className="mt-4 flex flex-col gap-4 border-t border-stone-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
      Customer Phone
    </p>

    <p className="mt-1 text-sm text-stone-700">
      {order.customerPhone || "Not provided"}
    </p>
  </div>

  <div className="text-left sm:text-right">
    <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
      Total
    </p>

    <p className="mt-1 text-2xl font-bold tracking-tight text-stone-900">
      {formatPrice(order.total)}
    </p>
  </div>
</div>

                  {/* Actions: full-width stacked buttons on mobile (44px+
                      touch targets), side-by-side from sm: up. Primary
                      action (status update) comes first so it's the one
                      thumbs reach without scrolling past "View Details". */}
                  <div className="mt-4 flex flex-col-reverse gap-2 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <Button
                      variant="outline"
                      className="h-11 w-full sm:h-9 sm:w-auto"
onClick={async () => {
  const fullOrder = await getOrderById(order.id);

setSelectedOrder(fullOrder);
setSelectedOrderIdLocal(fullOrder.id);
setDialogOpen(true);
}}
                    >
                     View Details →
                    </Button>

                    {nextStatus ? (
                      <Button
                        type="button"
                        disabled={isUpdating}
                      className={`h-11 w-full text-white sm:h-9 sm:w-auto ${
  ACTION_BUTTON_STYLES[order.status] ?? ""
}`}
                        onClick={() =>
                          void handleStatusUpdate(order.id, nextStatus)
                        }
                      >
                        {isUpdating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}

{nextStatus === "CONFIRMED"
  ? "Accept Order"
  : nextStatus === "PREPARING"
    ? "Start Preparing"
    : "Complete Order"}
    
                          </Button>
                    ) : (
                      <p className="text-center text-sm font-medium text-stone-500 sm:text-right">
                        This order is {STATUS_LABELS[order.status].toLowerCase()}.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
        {pagination.totalPages > 1 && (
  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4">
    <Button
      variant="outline"
      className="h-10 sm:h-9"
      disabled={!pagination.hasPreviousPage}
      onClick={() => setPage((prev) => prev - 1)}
    >
      Previous
    </Button>

    <p className="order-first w-full text-center text-sm text-stone-600 sm:order-none sm:w-auto">
      Page {pagination.page} of {pagination.totalPages}
    </p>

    <Button
      variant="outline"
      className="h-10 sm:h-9"
      disabled={!pagination.hasNextPage}
      onClick={() => setPage((prev) => prev + 1)}
    >
      Next
    </Button>
  </div>
)}
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
  setSelectedOrderIdLocal(null);
}}
  onStatusUpdate={(status) => {
    if (!selectedOrder) return;

    void handleStatusUpdate(selectedOrder.id, status);
  }}
  onReject={() => {
    if (!selectedOrder) return;

    void handleStatusUpdate(selectedOrder.id, "CANCELLED");
  }}
/>

    </DashboardShell>
  );
}