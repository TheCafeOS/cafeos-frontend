"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
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
  orderError: string;
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
  orderError,
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
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 99999,
        backgroundColor: "rgba(0, 0, 0, 0.60)",
        overflow: "hidden",
      }}
    >
      {/* ====================================================== */}
      {/* DRAWER                                                 */}
      {/* ====================================================== */}

      <div
        className="
          absolute
          inset-0
          w-full
          bg-white
          text-stone-900
          overflow-hidden

          sm:left-1/2
          sm:right-auto
          sm:top-1/2
          sm:bottom-auto
          sm:w-[calc(100%-32px)]
          sm:max-w-2xl
          sm:-translate-x-1/2
          sm:-translate-y-1/2
          sm:rounded-[28px]
          sm:shadow-2xl
        "
        style={{
          height: "100%",
          maxHeight: "100%",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr) auto",
        }}
      >
        {/* ================================================== */}
        {/* HEADER                                             */}
        {/* ================================================== */}

        <div
          className="
            border-b
            border-stone-200
            bg-white
            px-5
            py-4
            sm:px-6
            sm:py-5
          "
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold leading-tight text-stone-900">
                Your cart
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Ordering for {tableName}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close cart"
              className="
                shrink-0
                rounded-full
                p-2
                text-stone-500
                transition-colors
                hover:bg-stone-100
                hover:text-stone-900
                active:scale-95
              "
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* SCROLLABLE CONTENT                                  */}
        {/* ================================================== */}

        <div
          className="
            min-h-0
            min-w-0
            overflow-y-auto
            overscroll-contain
            px-5
            py-4
            sm:px-6
            sm:py-5
          "
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {cart.length === 0 ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <p className="text-center text-stone-500">
                Your cart is empty.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ================================================= */}
              {/* CART ITEMS                                         */}
              {/* ================================================= */}

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="
                    rounded-2xl
                    border
                    border-stone-200
                    p-4
                  "
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-stone-900">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-amber-700">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="
                        shrink-0
                        rounded-lg
                        p-2
                        text-red-500
                        transition-colors
                        hover:bg-red-50
                        active:scale-95
                      "
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-stone-200
                        p-1
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onQuantityChange(
                            item.id,
                            item.quantity - 1,
                          )
                        }
                        aria-label={`Decrease ${item.name} quantity`}
                        className="
                          rounded-lg
                          p-1.5
                          transition-colors
                          hover:bg-stone-100
                          active:scale-95
                        "
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
                        aria-label={`Increase ${item.name} quantity`}
                        className="
                          rounded-lg
                          p-1.5
                          transition-colors
                          hover:bg-stone-100
                          active:scale-95
                        "
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

              {/* ================================================= */}
              {/* PHONE NUMBER                                       */}
              {/* ================================================= */}

              <div className="border-t border-stone-200 pt-4">
                {loyaltyEnabled && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-stone-800">
                      Earn loyalty rewards
                    </p>

                    <p className="mt-0.5 text-xs text-stone-500">
                      Phone number required for loyalty
                    </p>
                  </div>
                )}

                <label
                  htmlFor="customerPhone"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Phone number
                </label>

                <input
                  id="customerPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
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
                    bg-white
                    px-4
                    py-3
                    text-stone-900
                    outline-none
                    transition-colors
                    placeholder:text-stone-400
                    focus:border-amber-600
                    focus:ring-1
                    focus:ring-amber-600
                  "
                />

                <div className="h-6" />
              </div>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* FOOTER                                             */}
        {/* ================================================== */}

        {cart.length > 0 && (
          <div
            className="
              border-t
              border-stone-200
              bg-white
              px-5
              pt-3
              sm:px-6
              sm:pt-4
            "
            style={{
              paddingBottom:
                "max(12px, env(safe-area-inset-bottom))",
              boxShadow:
                "0 -8px 20px rgba(0, 0, 0, 0.10)",
            }}
          >
            {/* TOTAL */}

            <div className="flex items-center justify-between gap-4">
              <span className="text-lg font-semibold text-stone-700">
                Total
              </span>

              <span className="text-2xl font-bold text-stone-900">
                {formatPrice(total)}
              </span>
            </div>

{orderError ? (
  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
    {orderError}
  </div>
) : null}

            {/* PLACE ORDER */}

            <button
              type="button"
              onClick={onPlaceOrder}
              disabled={isPlacingOrder}
              className="
                mt-3
                flex
                min-h-[52px]
                w-full
                items-center
                justify-center
                rounded-xl
                bg-amber-600
                px-4
                py-3
                font-semibold
                text-white
                shadow-sm
                transition-all
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
        )}
      </div>
    </div>,
    document.body,
  );
}