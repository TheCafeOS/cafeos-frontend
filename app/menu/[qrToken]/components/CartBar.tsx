import { ArrowRight, ShoppingBag } from "lucide-react";

type CartBarProps = {
  itemCount: number;
  total: number;
  formatPrice: (price: number) => string;
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
    <button
      type="button"
      onClick={onOpenCart}
      className="fixed bottom-5 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between rounded-2xl bg-stone-900 px-4 py-3 text-left text-white shadow-2xl transition hover:bg-stone-800 sm:px-6"
      aria-label="View cart and place order"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-stone-950">
          <ShoppingBag className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold">
            View cart · {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
          <p className="mt-0.5 text-xs text-stone-300">
            Review your order and checkout
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-xs text-stone-300">Total</p>
          <p className="text-base font-bold">{formatPrice(total)}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-amber-400" />
      </div>
    </button>
  );
}