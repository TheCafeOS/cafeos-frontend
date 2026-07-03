"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, ShoppingBag } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  imageUrl: string | null;
  categoryId: string | null;
  isAvailable: boolean;
};

type PublicMenuResponse = {
  table: {
    id: string;
    name: string;
    status: string;
  };
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
  categories: Category[];
  menuItems: MenuItem[];
};

type MenuPageProps = {
  params: Promise<{
    qrToken: string;
  }>;
};

export default function CustomerMenuPage({ params }: MenuPageProps) {
  const [menu, setMenu] = useState<PublicMenuResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const { qrToken } = await params;

        const response = await fetch(
          `http://localhost:4000/public/menu/${encodeURIComponent(qrToken)}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load this menu");
        }

        setMenu(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load this menu",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadMenu();
  }, [params]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
        <div className="flex flex-col items-center gap-3 text-stone-600">
          <Loader2 className="h-7 w-7 animate-spin text-amber-600" />
          <p>Loading menu...</p>
        </div>
      </main>
    );
  }

  if (error || !menu) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
        <section className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
            Menu unavailable
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-stone-900">
            We could not open this table menu
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {error || "Please ask the café staff for a valid QR code."}
          </p>
        </section>
      </main>
    );
  }

  const formatPrice = (price: string | number) =>
    `₹${Number(price).toFixed(2)}`;

  return (
    <main className="min-h-screen bg-stone-50 pb-10">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">
                CafeOS Menu
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
                {menu.restaurant.name}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-stone-600">
                <MapPin className="h-4 w-4 text-amber-600" />
                <span>Serving {menu.table.name}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        {menu.categories.map((category) => {
          const categoryItems = menu.menuItems.filter(
            (item) => item.categoryId === category.id,
          );

          if (categoryItems.length === 0) {
            return null;
          }

          return (
            <section key={category.id} className="mb-10">
              <h2 className="text-xl font-semibold text-stone-900">
                {category.name}
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryItems.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                  >
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
                        <h3 className="font-semibold text-stone-900">
                          {item.name}
                        </h3>
                        <p className="whitespace-nowrap font-semibold text-amber-700">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {item.description ? (
                        <p className="mt-2 text-sm leading-6 text-stone-600">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {menu.menuItems.filter((item) => !item.categoryId).length > 0 ? (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-stone-900">More items</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {menu.menuItems
                .filter((item) => !item.categoryId)
                .map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-stone-900">
                          {item.name}
                        </h3>
                        <p className="whitespace-nowrap font-semibold text-amber-700">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {item.description ? (
                        <p className="mt-2 text-sm leading-6 text-stone-600">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ) : null}

        {menu.menuItems.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600">
            No menu items are available right now.
          </div>
        ) : null}
      </div>
    </main>
  );
}