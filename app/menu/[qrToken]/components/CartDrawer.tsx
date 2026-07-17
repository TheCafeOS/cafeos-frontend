import { Minus, Plus, Trash2, X } from "lucide-react";
import type { MenuItem } from "./MenuCard";

export type CartItem = MenuItem & {
  quantity: number;
};

type CartDrawerProps = {
  isOpen: boolean;
  cart: CartItem[];
  tableName: string;
  customerPhone: string;
  isPlacingOrder: boolean;
  total: number;
  formatPrice: (price: string | number) => string;
  onClose: () => void;
  onPhoneChange: (value: string) => void;
  onQuantityChange: (menuItemId: string, quantity: number) => void;
  onRemove: (menuItemId: string) => void;
  onPlaceOrder: () => void;
};

export default function CartDrawer({
  isOpen,
  cart,
  tableName,
  customerPhone,
  isPlacingOrder,
  total,
  formatPrice,
  onClose,
  onPhoneChange,
  onQuantityChange,
  onRemove,
  onPlaceOrder,
}: CartDrawerProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute bottom-0 right-0 h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:top-0 sm:h-full sm:rounded-none">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-2xl font-semibold text-stone-900">Your cart</h2>
            <p className="mt-1 text-sm text-stone-500">
              Ordering for {tableName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 hover:bg-stone-100"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="py-16 text-center text-stone-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-4 py-5">
            {cart.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-stone-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-stone-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-amber-700">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-xl border border-stone-200 p-1">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                      className="rounded-lg p-1.5 hover:bg-stone-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="min-w-6 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                      className="rounded-lg p-1.5 hover:bg-stone-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="font-semibold text-stone-900">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}

            <div className="border-t border-stone-200 pt-5">
              <label
                htmlFor="customerPhone"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                Phone number <span className="text-stone-400">(optional)</span>
              </label>

              <input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(event) => onPhoneChange(event.target.value)}
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-600"
              />
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-5">
              <span className="text-lg font-semibold text-stone-700">Total</span>
              <span className="text-2xl font-bold text-stone-900">
                {formatPrice(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={onPlaceOrder}
              disabled={isPlacingOrder}
              className="w-full rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPlacingOrder ? "Placing order..." : "Place Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}