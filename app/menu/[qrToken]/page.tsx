"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, ShoppingBag } from "lucide-react";

import MenuCard, { type MenuItem } from "./components/MenuCard";
import CartBar from "./components/CartBar";
import CartDrawer, { type CartItem } from "./components/CartDrawer";
import CurrentOrderButton from "./components/CurrentOrderButton";
import CurrentOrderDrawer, {
  type CurrentOrder,
} from "./components/CurrentOrderDrawer";

type Category = {
  id: string;
  name: string;
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

type StoredOrder = {
  orderId: string;
};

const API_BASE_URL = "http://localhost:4000";

export default function CustomerMenuPage({ params }: MenuPageProps) {
  const [menu, setMenu] = useState<PublicMenuResponse | null>(null);
  const [qrToken, setQrToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");

  const [currentOrder, setCurrentOrder] = useState<CurrentOrder | null>(null);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [isRefreshingOrder, setIsRefreshingOrder] = useState(false);
  const [currentOrderError, setCurrentOrderError] = useState("");

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const resolvedParams = await params;
        const token = resolvedParams.qrToken;

        setQrToken(token);

        const response = await fetch(
          `${API_BASE_URL}/public/menu/${encodeURIComponent(token)}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load this menu");
        }

        setMenu(data);

        const storageKey = `cafeos-current-order-${token}`;
        const savedOrder = localStorage.getItem(storageKey);

        if (savedOrder) {
          try {
            const parsedOrder = JSON.parse(savedOrder) as StoredOrder;

            if (parsedOrder.orderId) {
              const orderResponse = await fetch(
                `${API_BASE_URL}/public/orders/${encodeURIComponent(
                  token,
                )}/${encodeURIComponent(parsedOrder.orderId)}`,
              );

              const orderData = await orderResponse.json();

              if (orderResponse.ok) {
                setCurrentOrder(orderData);
              } else {
                localStorage.removeItem(storageKey);
              }
            }
          } catch {
            localStorage.removeItem(storageKey);
          }
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load this menu",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadMenu();
  }, [params]);

  const formatPrice = (price: string | number) => {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return "₹0.00";
    }

    return `₹${numericPrice.toFixed(2)}`;
  };

  const cartItemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0,
      ),
    [cart],
  );

  function addToCart(menuItem: MenuItem) {
    if (menuItem.isAvailable === false) {
      return;
    }

    setOrderMessage("");
    setOrderError("");

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === menuItem.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentCart, { ...menuItem, quantity: 1 }];
    });
  }

  function updateQuantity(menuItemId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((currentCart) =>
        currentCart.filter((item) => item.id !== menuItemId),
      );
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === menuItemId ? { ...item, quantity } : item,
      ),
    );
  }

  function removeFromCart(menuItemId: string) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== menuItemId),
    );
  }

  async function fetchCurrentOrder(orderId: string, showLoading = true) {
    if (!qrToken) {
      return;
    }

    if (showLoading) {
      setIsRefreshingOrder(true);
    }

    setCurrentOrderError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/public/orders/${encodeURIComponent(
          qrToken,
        )}/${encodeURIComponent(orderId)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not fetch order status");
      }

      setCurrentOrder(data);
    } catch (caughtError) {
      setCurrentOrderError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not fetch order status",
      );
    } finally {
      if (showLoading) {
        setIsRefreshingOrder(false);
      }
    }
  }

  async function handlePlaceOrder() {
    if (!menu || cart.length === 0 || !qrToken) {
      return;
    }

    setOrderMessage("");
    setOrderError("");
    setIsPlacingOrder(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/public/orders/${encodeURIComponent(qrToken)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerPhone: customerPhone.trim() || undefined,
            items: cart.map((item) => ({
              menuItemId: item.id,
              quantity: item.quantity,
            })),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to place order. Please ask the café staff for help.",
        );
      }

      localStorage.setItem(
        `cafeos-current-order-${qrToken}`,
        JSON.stringify({
          orderId: data.id,
        }),
      );

      setOrderMessage(
        "Order placed successfully. You can track it from the Orders button.",
      );

      setCart([]);
      setCustomerPhone("");
      setIsCartOpen(false);

      await fetchCurrentOrder(data.id, false);
    } catch (caughtError) {
      setOrderError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to place order. Please try again.",
      );
    } finally {
      setIsPlacingOrder(false);
    }
  }

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

  const uncategorizedItems = menu.menuItems.filter((item) => !item.categoryId);

  return (
    <main className="min-h-screen bg-stone-50 pb-32">
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

            <div className="flex items-center gap-2">
              {currentOrder ? (
                <CurrentOrderButton
                  status={currentOrder.status}
                  onClick={() => setIsOrderDrawerOpen(true)}
                />
              ) : null}

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-2xl bg-amber-100 p-3 text-amber-700 transition hover:bg-amber-200"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-6 w-6" />

                {cartItemCount > 0 ? (
                  <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-600 px-1 text-xs font-bold text-white">
                    {cartItemCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </header>

      {orderMessage ? (
        <div className="mx-auto mt-5 max-w-5xl px-5 sm:px-8">
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {orderMessage}
          </div>
        </div>
      ) : null}

      {orderError ? (
        <div className="mx-auto mt-5 max-w-5xl px-5 sm:px-8">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {orderError}
          </div>
        </div>
      ) : null}

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
                  <MenuCard
                    key={item.id}
                    item={item}
                    formatPrice={formatPrice}
                    onAddToCart={() => addToCart(item)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {uncategorizedItems.length > 0 ? (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-stone-900">
              More items
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {uncategorizedItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  formatPrice={formatPrice}
                  onAddToCart={() => addToCart(item)}
                />
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

      <CartBar
        itemCount={cartItemCount}
        total={cartTotal}
        formatPrice={formatPrice}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        tableName={menu.table.name}
        customerPhone={customerPhone}
        isPlacingOrder={isPlacingOrder}
        total={cartTotal}
        formatPrice={formatPrice}
        onClose={() => setIsCartOpen(false)}
        onPhoneChange={setCustomerPhone}
        onQuantityChange={updateQuantity}
        onRemove={removeFromCart}
        onPlaceOrder={handlePlaceOrder}
      />

      <CurrentOrderDrawer
        isOpen={isOrderDrawerOpen}
        order={currentOrder}
        isRefreshing={isRefreshingOrder}
        error={currentOrderError}
        formatPrice={formatPrice}
        onClose={() => setIsOrderDrawerOpen(false)}
        onRefresh={() => {
          if (currentOrder) {
            void fetchCurrentOrder(currentOrder.id);
          }
        }}
      />
    </main>
  );
}