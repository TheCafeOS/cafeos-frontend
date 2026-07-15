import { Plus, CheckCircle2, XCircle } from "lucide-react";

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  imageUrl: string | null;
  categoryId: string | null;
  isAvailable?: boolean;
};

type MenuCardProps = {
  item: MenuItem;
  formatPrice: (price: string | number) => string;
  onAddToCart: () => void;
};

export default function MenuCard({
  item,
  formatPrice,
  onAddToCart,
}: MenuCardProps) {
  const isUnavailable = item.isAvailable === false;

  return (
    <article className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-52 items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 text-6xl">
            🍽️
          </div>
        )}

        <div className="absolute right-3 top-3">
          {isUnavailable ? (
            <span className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow">
              <XCircle className="h-3.5 w-3.5" />
              Unavailable
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Available
            </span>
          )}
        </div>
      </div>

      <div className="flex h-[220px] flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-stone-900">
            {item.name}
          </h3>

          <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700">
            {formatPrice(item.price)}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
          {item.description || "Freshly prepared and served with care."}
        </p>

        <div className="mt-auto pt-5">
          <button
            type="button"
            disabled={isUnavailable}
            onClick={onAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 font-semibold text-white transition-all duration-300 hover:bg-orange-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            <Plus className="h-5 w-5" />

            {isUnavailable ? "Unavailable" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}