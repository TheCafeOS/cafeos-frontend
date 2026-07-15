"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin, ShoppingBag } from "lucide-react";
import { io } from "socket.io-client";

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

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type MenuPageProps = {
  params: Promise<{
    qrToken: string;
  }>;
};

type StoredOrder = {
  orderId: string;
};

type OrderUpdatedPayload = {
  orderId: string;
  status: CurrentOrder["status"];
  timestamp: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function unwrapApiResponse<T>(body: ApiResponse<T> | T): T {
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    (body as ApiResponse<T>).data !== undefined
  ) {
    return (body as ApiResponse<T>).data as T;
  }

  return body as T;
}

function normalizeMenu(data: PublicMenuResponse): PublicMenuResponse {
  return {
    table: data.table,
    restaurant: data.restaurant,
    categories: Array.isArray(data.categories) ? data.categories : [],
    menuItems: Array.isArray(data.menuItems) ? data.menuItems : [],
  };
}

async function safelyReadJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function getApiMessage(body: unknown): string {
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof (body as { message?: unknown }).message === "string"
  ) {
    return (body as { message: string }).message;
  }

  return "";
}

export default function CustomerMenuPage({ params }: MenuPageProps) {
  const [menu, setMenu] = useState<PublicMenuResponse | null>(null);
  const [qrToken, setQrToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
const [searchQuery, setSearchQuery] = useState("");
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

  const currentOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentOrderIdRef.current = currentOrder?.id ?? null;
  }, [currentOrder?.id]);

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
        `${API_BASE_URL}/api/v1/public/orders/${encodeURIComponent(
          qrToken,
        )}/${encodeURIComponent(orderId)}`,
      );

      const responseBody =
        await safelyReadJson<ApiResponse<CurrentOrder> | CurrentOrder>(
          response,
        );

      if (!response.ok || !responseBody) {
        throw new Error(
          getApiMessage(responseBody) || "Could not fetch order status.",
        );
      }

      setCurrentOrder(unwrapApiResponse<CurrentOrder>(responseBody));
    } catch (caughtError) {
      setCurrentOrderError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not fetch order status.",
      );
    } finally {
      if (showLoading) {
        setIsRefreshingOrder(false);
      }
    }
  }

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setIsLoading(true);
        setError("");
        setMenu(null);

        const resolvedParams = await params;
        const token = resolvedParams.qrToken;

        if (!token) {
          throw new Error("Invalid QR code.");
        }

        setQrToken(token);

        const response = await fetch(
          `${API_BASE_URL}/api/v1/public/menu/${encodeURIComponent(token)}`,
        );

        const responseBody = await safelyReadJson<
          ApiResponse<PublicMenuResponse> | PublicMenuResponse
        >(response);

        if (!response.ok) {
          const backendMessage = getApiMessage(responseBody);

          if (response.status === 403) {
            throw new Error(
              "This table is currently inactive. Please ask a staff member for assistance.",
            );
          }

          if (response.status === 404) {
            throw new Error(
              "This QR code is invalid or this table is no longer available.",
            );
          }

          throw new Error(
            backendMessage || "We could not load this menu. Please try again.",
          );
        }

        if (!responseBody) {
          throw new Error("The café server returned an invalid menu response.");
        }

        const menuData = unwrapApiResponse<PublicMenuResponse>(responseBody);

        if (!menuData?.table || !menuData?.restaurant) {
          throw new Error("Invalid menu response received from server.");
        }

        setMenu(normalizeMenu(menuData));

        const storageKey = `cafeos-current-order-${token}`;
        const savedOrder = localStorage.getItem(storageKey);

        if (!savedOrder) {
          setCurrentOrder(null);
          return;
        }

        try {
          const parsedOrder = JSON.parse(savedOrder) as StoredOrder;

          if (!parsedOrder.orderId) {
            localStorage.removeItem(storageKey);
            setCurrentOrder(null);
            return;
          }

          const orderResponse = await fetch(
            `${API_BASE_URL}/api/v1/public/orders/${encodeURIComponent(
              token,
            )}/${encodeURIComponent(parsedOrder.orderId)}`,
          );

          const orderBody =
            await safelyReadJson<ApiResponse<CurrentOrder> | CurrentOrder>(
              orderResponse,
            );

          if (orderResponse.ok && orderBody) {
            setCurrentOrder(unwrapApiResponse<CurrentOrder>(orderBody));
          } else {
            localStorage.removeItem(storageKey);
            setCurrentOrder(null);
          }
        } catch {
          localStorage.removeItem(storageKey);
          setCurrentOrder(null);
        }
      } catch (caughtError) {
        setMenu(null);

        if (caughtError instanceof TypeError) {
          setError(
            "We could not connect to the café server. Please ask a staff member for assistance.",
          );
        } else {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load this menu.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadMenu();
  }, [params]);

  useEffect(() => {
    if (!qrToken) {
      return;
    }

    const socket = io(API_BASE_URL);

    socket.on("connect", () => {
      socket.emit("join_qr", qrToken);
    });

    socket.on("ORDER_UPDATED", (payload: OrderUpdatedPayload) => {
      if (payload.orderId !== currentOrderIdRef.current) {
        return;
      }

      void fetchCurrentOrder(payload.orderId, false);
    });

    return () => {
      socket.disconnect();
    };
  }, [qrToken]);

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

  async function handlePlaceOrder() {
    if (!menu || cart.length === 0 || !qrToken) {
      return;
    }

    setOrderMessage("");
    setOrderError("");
    setIsPlacingOrder(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/public/orders/${encodeURIComponent(qrToken)}`,
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

      const responseBody =
        await safelyReadJson<ApiResponse<CurrentOrder> | CurrentOrder>(
          response,
        );

      if (!response.ok || !responseBody) {
        throw new Error(
          getApiMessage(responseBody) ||
            "Failed to place order. Please ask the café staff for help.",
        );
      }

      const createdOrder = unwrapApiResponse<CurrentOrder>(responseBody);

      if (!createdOrder?.id) {
        throw new Error("The café server returned an invalid order response.");
      }

      localStorage.setItem(
        `cafeos-current-order-${qrToken}`,
        JSON.stringify({
          orderId: createdOrder.id,
        }),
      );

      setOrderMessage(
        "Order placed successfully. You can track or follow its progress below.",
      );

      setCart([]);
      setCustomerPhone("");
      setIsCartOpen(false);

      await fetchCurrentOrder(createdOrder.id, false);
setIsOrderDrawerOpen(true);
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

  const categories = menu.categories ?? [];
const menuItems = menu.menuItems ?? [];


const filteredMenuItems = menuItems.filter((item) => {
  const query = searchQuery.trim().toLowerCase();

  if (!query) return true;

  const categoryName =
    categories.find((category) => category.id === item.categoryId)?.name ?? "";

  return (
    item.name.toLowerCase().includes(query) ||
    (item.description ?? "").toLowerCase().includes(query) ||
    categoryName.toLowerCase().includes(query)
  );
});

const uncategorizedItems = filteredMenuItems.filter(
  (item) => !item.categoryId
);

const greeting = (() => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning ☀️";
  if (hour < 17) return "Good Afternoon 🌤️";
  return "Good Evening 🌙";
})();
  return (
    <main className="min-h-screen bg-stone-50 pb-32">
      <header className="sticky top-0 z-20 border-b border-orange-100 bg-gradient-to-b from-white via-orange-50/40 to-white backdrop-blur">
  <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
          🍽 CafeOS
        </span>

        <p className="mt-4 text-sm font-medium text-stone-500">
          {greeting}
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
          {menu.restaurant.name}
        </h1>

        <p className="mt-2 text-sm text-stone-600">
          Freshly prepared food made with care.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 shadow-sm">
          <MapPin className="h-4 w-4 text-orange-600" />

          <span className="text-sm font-medium text-stone-700">
            {menu.table.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {currentOrder && (
          <CurrentOrderButton
            status={currentOrder.status}
            onClick={() => setIsOrderDrawerOpen(true)}
          />
        )}

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          aria-label="Open Cart"
          className="relative rounded-2xl bg-orange-100 p-3 text-orange-700 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-orange-200 hover:shadow-md"
        >
          <ShoppingBag className="h-6 w-6" />

          {cartItemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-600 px-1 text-xs font-bold text-white shadow">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  </div>
</header>

 <div className="sticky top-[120px] z-10 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
  <div className="mx-auto max-w-5xl px-5 py-4 sm:px-8">

    <input
      type="text"
      placeholder="🔍 Search dishes..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full rounded-2xl border border-stone-200 bg-white px-5 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
    />
<div className="mt-5 flex gap-2 overflow-x-auto pb-2">
  <button
    type="button"
    onClick={() =>
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
    className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white whitespace-nowrap"
  >
    All
  </button>

  {categories.map((category) => (
    <button
      key={category.id}
      type="button"
      onClick={() =>
        document
          .getElementById(`category-${category.id}`)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
      }
      className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 whitespace-nowrap hover:bg-orange-50 hover:border-orange-300 transition"
    >
      {category.name}
    </button>
  ))}
</div>
  </div>
</div>
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
        {categories.map((category) => {
       const categoryItems = filteredMenuItems.filter(
  (item) => item.categoryId === category.id,
);

          if (categoryItems.length === 0) {
            return null;
          }

          return (
           <section
  key={category.id}
  id={`category-${category.id}`}
  className="mb-10 scroll-mt-48"
>
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

       {filteredMenuItems.length === 0 ? (
         <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
  <div className="text-5xl">🍽️</div>

  <h3 className="mt-4 text-xl font-semibold text-stone-900">
    No dishes found
  </h3>

  <p className="mt-2 text-stone-600">
    Try searching with another keyword.
  </p>
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
        tableName={menu.table.name}
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