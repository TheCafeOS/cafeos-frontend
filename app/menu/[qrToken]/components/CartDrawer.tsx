"use client";

import { useEffect } from "react";
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
  loyaltyEnabled: boolean;
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
  loyaltyEnabled,
  formatPrice,
  onClose,
  onPhoneChange,
  onQuantityChange,
  onRemove,
  onPlaceOrder,
}: CartDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-3xl">
        {/* Header */}
        <div className="shrink-0 border-b border-stone-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-stone-900">
                Your cart
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Ordering for {tableName}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="flex min-h-[240px] flex-1 items-center justify-center px-6">
            <p className="text-center text-stone-500">
              Your cart is empty.
            </p>
          </div>
        ) : (
          <>
            {/* Scrollable cart content */}
            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                overscroll-contain
                px-6
                py-5
                touch-pan-y
              "
            >
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-stone-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-stone-900">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-sm text-amber-700">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="shrink-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 rounded-xl border border-stone-200 p-1">
                        <button
                          type="button"
                          onClick={() =>
                            onQuantityChange(
                              item.id,
                              item.quantity - 1,
                            )
                          }
                          className="rounded-lg p-1.5 transition-colors hover:bg-stone-100"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="min-w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            onQuantityChange(
                              item.id,
                              item.quantity + 1,
                            )
                          }
                          className="rounded-lg p-1.5 transition-colors hover:bg-stone-100"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="shrink-0 font-semibold text-stone-900">
                        {formatPrice(
                          Number(item.price) * item.quantity,
                        )}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Phone + Loyalty */}
                <div className="border-t border-stone-200 pt-4">
                  {loyaltyEnabled && (
                    <>
                      <p className="text-sm font-semibold text-stone-800">
                        Earn loyalty rewards
                      </p>

                      <p className="mt-0.5 text-xs text-stone-500">
                        Phone number required for loyalty
                      </p>
                    </>
                  )}

                  <div className={loyaltyEnabled ? "mt-3" : ""}>
                    <label
                      htmlFor="customerPhone"
                      className="mb-1.5 block text-sm font-medium text-stone-700"
                    >
                      Phone number
                    </label>

                    <input
                      id="customerPhone"
                      type="tel"
                      inputMode="tel"
                      value={customerPhone}
                      onChange={(event) =>
                        onPhoneChange(event.target.value)
                      }
                      placeholder="Enter your phone number"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-stone-300
                        px-4
                        py-2.5
                        text-sm
                        text-stone-900
                        outline-none
                        transition-colors
                        placeholder:text-stone-400
                        focus:border-amber-600
                        focus:ring-1
                        focus:ring-amber-600
                      "
                    />
                  </div>
                </div>

                {/* Bottom spacing so the last content isn't hidden */}
                <div className="h-2" />
              </div>
            </div>

            {/* Fixed footer */}
            <div
              className="
                shrink-0
                border-t
                border-stone-200
                bg-white
                px-6
                pb-[max(1rem,env(safe-area-inset-bottom))]
                pt-4
              "
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-lg font-semibold text-stone-700">
                  Total
                </span>

                <span className="text-2xl font-bold text-stone-900">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                type="button"
                onClick={onPlaceOrder}
                disabled={isPlacingOrder}
                className="
                  mt-4
                  w-full
                  rounded-xl
                  bg-amber-600
                  px-4
                  py-3.5
                  font-semibold
                  text-white
                  transition
                  hover:bg-amber-700
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isPlacingOrder
                  ? "Placing order..."
                  : "Place Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}