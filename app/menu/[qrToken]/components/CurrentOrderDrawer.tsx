import {
  Check,
  Circle,
  Clock3,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";

import { formatRelativeTime } from "@/lib/utils";
import { useRelativeTime } from "@/hooks/use-relative-time";

type OrderItem = {
  id: string;
  quantity: number;
  price: string | number;
  menuItem: {
    id: string;
    name: string;
    price: string | number;
  };
};

export type CurrentOrder = {
  id: string;
  status: string;
  total: string | number;
  customerPhone: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

type CurrentOrderDrawerProps = {
  isOpen: boolean;
  orders: CurrentOrder[];
  orderType: "NONE" | "COMBINED" | "SEPARATE";
  combinedTotal: number;
  tableName: string;
  isRefreshing: boolean;
  error: string;
  formatPrice: (price: string | number) => string;
  onClose: () => void;
  onRefresh: () => void;
};

const ORDER_STEPS = [
  {
    status: "PENDING",
    title: "Order placed",
    description: "Your order has been sent to the café.",
  },
  {
    status: "CONFIRMED",
    title: "Accepted",
    description: "The café has accepted your order.",
  },
  {
    status: "PREPARING",
    title: "Preparing",
    description: "Your items are being prepared.",
  },
  {
    status: "READY",
    title: "Ready",
    description: "Your order is ready to be served.",
  },
  {
    status: "COMPLETED",
    title: "Delivered",
    description: "Your order has been delivered. Enjoy your meal!",
  },
] as const;

function formatStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "CONFIRMED":
      return "Accepted";

    case "PREPARING":
      return "Preparing";

    case "READY":
      return "Ready";

    case "COMPLETED":
      return "Delivered";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

function getCurrentStepIndex(status: string) {
  return ORDER_STEPS.findIndex((step) => step.status === status);
}

function OrderProgress({
  order,
}: {
  order: CurrentOrder;
}) {
  const isCancelled = order.status === "CANCELLED";
  const currentStepIndex = getCurrentStepIndex(order.status);

  if (isCancelled) {
    return (
      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="font-semibold text-red-900">Order cancelled</p>

        <p className="mt-1 text-sm leading-6 text-red-800">
          Please speak with the café staff if you need more information.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {ORDER_STEPS.map((step, index) => {
        const isCompleted = currentStepIndex >= index;
        const isCurrent = currentStepIndex === index;

        return (
          <div key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  isCompleted
                    ? "bg-amber-600 text-white"
                    : "border border-stone-300 bg-white text-stone-400"
                }`}
              >
                {isCompleted ? (
                  isCurrent ? (
                    <Clock3 className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>

              {index < ORDER_STEPS.length - 1 ? (
                <div
                  className={`mt-1 h-8 w-px ${
                    currentStepIndex > index
                      ? "bg-amber-500"
                      : "bg-stone-200"
                  }`}
                />
              ) : null}
            </div>

            <div className="pb-2">
              <p
                className={`font-semibold ${
                  isCompleted ? "text-stone-900" : "text-stone-400"
                }`}
              >
                {step.title}
              </p>

              <p
                className={`mt-0.5 text-sm ${
                  isCompleted ? "text-stone-600" : "text-stone-400"
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({
  order,
  orderNumber,
  formatPrice,
}: {
  order: CurrentOrder;
  orderNumber?: number;
  formatPrice: (price: string | number) => string;
}) {
  const isCancelled = order.status === "CANCELLED";

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4">
      {/* Order header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
            {orderNumber ? `Order ${orderNumber}` : "Order"}
          </p>

          <p className="mt-1 text-sm font-semibold text-stone-900">
            #{order.id.slice(-6).toUpperCase()}
          </p>

          <p className="mt-1 text-xs text-stone-500">
            Placed {formatRelativeTime(order.createdAt)}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isCancelled
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {formatStatus(order.status)}
        </span>
      </div>

      {/* Status */}
      <div
        className={`mt-4 rounded-2xl border p-4 ${
          isCancelled
            ? "border-red-200 bg-red-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${
            isCancelled ? "text-red-700" : "text-amber-700"
          }`}
        >
          Current status
        </p>

        <p
          className={`mt-1 text-lg font-bold ${
            isCancelled ? "text-red-900" : "text-amber-900"
          }`}
        >
          {formatStatus(order.status)}
        </p>

        <p
          className={`mt-1 text-sm ${
            isCancelled ? "text-red-800" : "text-amber-800"
          }`}
        >
          Placed {formatRelativeTime(order.createdAt)}
        </p>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <h4 className="font-semibold text-stone-900">
          Order progress
        </h4>

        <OrderProgress order={order} />
      </div>

      {/* Items */}
      <div className="mt-6">
        <h4 className="font-semibold text-stone-900">
          Order items
        </h4>

        <div className="mt-3 space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-stone-200 p-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-stone-900">
                  {item.menuItem.name}
                </p>

                <p className="mt-1 text-sm text-stone-500">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>

              <p className="ml-4 shrink-0 font-semibold text-stone-900">
                {formatPrice(Number(item.price) * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Individual total */}
      <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4">
        <span className="font-semibold text-stone-600">
          Order total
        </span>

        <span className="text-xl font-bold text-stone-900">
          {formatPrice(order.total)}
        </span>
      </div>
    </section>
  );
}

function CombinedOrderCard({
  orders,
  combinedTotal,
  formatPrice,
}: {
  orders: CurrentOrder[];
  combinedTotal: number;
  formatPrice: (price: string | number) => string;
}) {
  const combinedItems = orders
    .flatMap((order) => order.items)
    .reduce<
      {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
      }[]
    >((items, item) => {
      const existing = items.find(
        (entry) => entry.menuItemId === item.menuItem.id,
      );

      if (existing) {
        existing.quantity += item.quantity;
      } else {
        items.push({
          menuItemId: item.menuItem.id,
          name: item.menuItem.name,
          price: Number(item.price),
          quantity: item.quantity,
        });
      }

      return items;
    }, []);

  const combinedStatus =
    orders.every((order) => order.status === "PENDING")
      ? "PENDING"
      : orders[0]?.status ?? "PENDING";

  const combinedOrderForProgress: CurrentOrder = {
    ...orders[0],
    status: combinedStatus,
    total: combinedTotal,
    items: [],
  };

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4">
      {/* Combined status */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
          Combined status
        </p>

        <p className="mt-1 text-lg font-bold text-amber-900">
          {formatStatus(combinedStatus)}
        </p>

        <p className="mt-1 text-sm text-amber-800">
          Your orders are currently being handled together by the café.
        </p>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <h4 className="font-semibold text-stone-900">
          Order progress
        </h4>

        <OrderProgress order={combinedOrderForProgress} />
      </div>

      {/* Combined items */}
      <div className="mt-6">
        <h4 className="font-semibold text-stone-900">
          All ordered items
        </h4>

        <div className="mt-3 space-y-3">
          {combinedItems.map((item) => (
            <div
              key={item.menuItemId}
              className="flex items-center justify-between rounded-xl border border-stone-200 p-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-stone-900">
                  {item.name}
                </p>

                <p className="mt-1 text-sm text-stone-500">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>

              <p className="ml-4 shrink-0 font-semibold text-stone-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Individual order IDs */}
      <div className="mt-6">
        <h4 className="font-semibold text-stone-900">
          Orders
        </h4>

        <div className="mt-3 space-y-2">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
                  Order {index + 1}
                </p>

                <p className="mt-1 font-semibold text-stone-900">
                  #{order.id.slice(-6).toUpperCase()}
                </p>
              </div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                {formatStatus(order.status)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Combined total */}
      <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-5">
        <span className="text-lg font-semibold text-stone-700">
          Combined total
        </span>

        <span className="text-2xl font-bold text-stone-900">
          {formatPrice(combinedTotal)}
        </span>
      </div>
    </section>
  );
}

export default function CurrentOrderDrawer({
  isOpen,
  orders,
  orderType,
  combinedTotal,
  tableName,
  isRefreshing,
  error,
  formatPrice,
  onClose,
  onRefresh,
}: CurrentOrderDrawerProps) {
  useRelativeTime();

  if (!isOpen || orders.length === 0 || orderType === "NONE") {
    return null;
  }

  const isCombined = orderType === "COMBINED";

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
<div className="absolute bottom-0 right-0 h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-6 shadow-2xl sm:top-0 sm:h-full sm:rounded-none">
          {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              {isCombined ? "Combined order" : "Current orders"}
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-stone-900">
              {orders.length === 1 ? "Your order" : `${orders.length} orders`}
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {tableName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 hover:bg-stone-100"
            aria-label="Close order"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Combined order explanation */}
        {isCombined && orders.length > 1 ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-semibold text-amber-900">
              Your orders are combined
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              You have multiple active orders at this table. They are shown
              together below.
            </p>
          </div>
        ) : null}

        {/* Error */}
        {error ? (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

       {/* Orders */}
<div className="mt-6">
  {isCombined && orders.length > 1 ? (
    <CombinedOrderCard
      orders={orders}
      combinedTotal={combinedTotal}
      formatPrice={formatPrice}
    />
  ) : (
    <div className="space-y-5">
      {orders.map((order, index) => (
        <OrderCard
          key={order.id}
          order={order}
          orderNumber={orders.length > 1 ? index + 1 : undefined}
          formatPrice={formatPrice}
        />
      ))}
    </div>
  )}
</div>


        {/* Single order total is already displayed inside OrderCard */}

        {/* Refresh */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-3 font-semibold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}

          {isRefreshing ? "Refreshing..." : "Refresh status"}
        </button>
      </div>
    </div>
  );
}