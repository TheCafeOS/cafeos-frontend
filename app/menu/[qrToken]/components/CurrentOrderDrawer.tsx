import { Loader2, RefreshCw, X } from "lucide-react";

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
  isRefreshing: boolean;
  error: string;
  formatPrice: (price: string | number) => string;
  onClose: () => void;
  onRefresh: () => void;
};

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function CurrentOrderDrawer({
  isOpen,
  order,
  isRefreshing,
  error,
  formatPrice,
  onClose,
  onRefresh,
}: CurrentOrderDrawerProps) {
  if (!isOpen || !order) {
    return null;
  }

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
              Order ID: {order.id.slice(-6).toUpperCase()}
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

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Status
          </p>

          <p className="mt-1 text-lg font-bold text-amber-900">
            {formatStatus(order.status)}
          </p>

          <p className="mt-1 text-sm text-amber-800">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 space-y-3">
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