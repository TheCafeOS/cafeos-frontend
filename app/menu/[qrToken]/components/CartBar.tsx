"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";

type CartBarProps = {
  itemCount: number;
  total: number;
  formatPrice: (price: string | number) => string;
  onOpenCart: () => void;
};

export default function CartBar({
  itemCount,
  total,
  formatPrice,
  onOpenCart,
}: CartBarProps) {
  if (itemCount === 0) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-x-0
        bottom-0
        z-[99990]
        px-3
        pb-[max(12px,env(safe-area-inset-bottom))]
        sm:px-4
      "
    >
      <button
        type="button"
        onClick={onOpenCart}
        aria-label="Open cart"
        className="
          mx-auto
          flex
          w-full
          max-w-5xl
          items-center
          justify-between
          gap-3
          rounded-2xl
          border
          border-stone-200
          bg-white
          px-4
          py-3
          text-left
          shadow-[0_8px_30px_rgba(0,0,0,0.18)]
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:shadow-[0_12px_35px_rgba(0,0,0,0.22)]
          active:scale-[0.99]
          sm:px-5
          sm:py-3.5
        "
      >
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-orange-100
              text-orange-600
            "
          >
            <ShoppingBag className="h-5 w-5" />
          </div>

          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-stone-900 sm:text-base">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </p>

            <p className="mt-0.5 truncate text-xs text-stone-500 sm:text-sm">
              Ready to place your order
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-stone-400 sm:text-xs">
              Total
            </p>

            <p className="text-base font-bold text-orange-600 sm:text-lg">
              {formatPrice(total)}
            </p>
          </div>

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-orange-100
              text-orange-600
            "
          >
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </button>
    </div>
  );
}