import {
  Check,
  Circle,
  Clock3,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";

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
  order: CurrentOrder | null;
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
    title: "Completed",
    description: "Your order has been completed. Thank you.",
  },
] as const;

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function getCurrentStepIndex(status: string) {
  return ORDER_STEPS.findIndex((step) => step.status === status);
}

export default function CurrentOrderDrawer({
  isOpen,
  order,
  tableName,
  isRefreshing,
  error,
  formatPrice,
  onClose,
  onRefresh,
}: CurrentOrderDrawerProps) {
  if (!isOpen || !order) {
    return null;
  }

  const isCancelled = order.status === "CANCELLED";
  const currentStepIndex = getCurrentStepIndex(order.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute bottom-0 right-0 h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:top-0 sm:h-full sm:rounded-none">
        <div className="flex items-start justify-between border-b border-stone-200 pb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              Current order
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-stone-900">
              Your order
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Order #{order.id.slice(-6).toUpperCase()} · {tableName}
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

        <div
          className={`mt-5 rounded-2xl border p-4 ${
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
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {isCancelled ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-900">Order cancelled</p>
            <p className="mt-1 text-sm leading-6 text-red-800">
              Please speak with the café staff if you need more information.
            </p>
          </div>
        ) : (
          <section className="mt-6">
            <h3 className="font-semibold text-stone-900">Order progress</h3>

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
          </section>
        )}

        {error ? (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-stone-900">Order items</h3>

          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-stone-200 p-4"
            >
              <div>
                <p className="font-semibold text-stone-900">
                  {item.menuItem.name}
                </p>

                <p className="mt-1 text-sm text-stone-500">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>

              <p className="font-semibold text-stone-900">
                {formatPrice(Number(item.price) * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-5">
          <span className="text-lg font-semibold text-stone-700">Total</span>

          <span className="text-2xl font-bold text-stone-900">
            {formatPrice(order.total)}
          </span>
        </div>

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