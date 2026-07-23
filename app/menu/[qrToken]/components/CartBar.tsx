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
<div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">      <button
        type="button"
        onClick={onOpenCart}
        aria-label="View cart and place order"
        className="
mx-auto
flex
w-full
max-w-xl
items-center
justify-between
rounded-2xl
border
border-orange-200
bg-white/95
px-4
py-3
shadow-xl
backdrop-blur-md
transition-all
duration-300
hover:-translate-y-0.5
active:scale-[0.98]
"
      >
        {/* Left */}
        <div className="flex items-center gap-3">
<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">    
          <ShoppingBag className="h-5 w-5" />
          </div>

         <div className="min-w-0">
<p className="truncate text-sm font-semibold text-stone-900 sm:text-base">              {itemCount} {itemCount === 1 ? "Item" : "Items"}
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
<p className="text-lg font-bold text-orange-600 sm:text-xl">
              {formatPrice(total)}
            </p>
          </div>

<div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">       
       <ArrowRight className="h- 4w-4" />
          </div>
        </div>
      </button>
    </div>
  );
}