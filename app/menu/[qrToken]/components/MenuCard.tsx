import { Plus } from "lucide-react";

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
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="flex h-44 items-center justify-center bg-amber-50 text-4xl">
          ☕
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-stone-900">{item.name}</h3>

          <p className="whitespace-nowrap font-semibold text-amber-700">
            {formatPrice(item.price)}
          </p>
        </div>

        <p className="mt-2 min-h-10 text-sm leading-6 text-stone-600">
          {item.description || "No description available."}
        </p>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={isUnavailable}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          <Plus className="h-4 w-4" />
          {isUnavailable ? "Unavailable" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}