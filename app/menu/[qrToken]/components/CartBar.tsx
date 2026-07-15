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
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={onOpenCart}
        aria-label="View cart and place order"
        className="
          mx-auto
          flex
          w-full
          max-w-2xl
          items-center
          justify-between
          rounded-3xl
          border
          border-orange-200
          bg-white/95
          px-5
          py-4
          shadow-[0_12px_35px_rgba(0,0,0,0.12)]
          backdrop-blur-md
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)]
          active:scale-[0.98]
        "
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
            <ShoppingBag className="h-6 w-6" />
          </div>

          <div>
            <p className="text-base font-bold text-stone-900">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </p>

            <p className="mt-1 text-sm text-stone-500">
              Ready to place your order
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-stone-400">
              Total
            </p>

            <p className="text-xl font-bold text-orange-600">
              {formatPrice(total)}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition group-hover:bg-orange-200">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </button>
    </div>
  );
}