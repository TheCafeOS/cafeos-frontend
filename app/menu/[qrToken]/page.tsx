"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
} from "lucide-react";
import RestaurantHeader from "./components/RestaurantHeader";
import { io } from "socket.io-client";


import { UtensilsCrossed } from "lucide-react";
import MenuCard, { type MenuItem } from "./components/MenuCard";
import CartBar from "./components/CartBar";
import CartDrawer, { type CartItem } from "./components/CartDrawer";
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

  logoUrl: string | null;
  coverImageUrl: string | null;

  tagline: string | null;
  cuisineType: string | null;

  themeColor: string | null;
}
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

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
const [activeCategory, setActiveCategory] = useState("all");

// Phase 3 complete: RestaurantHeader now reads --collapse-progress
// directly and no longer takes a collapsedHeader prop, so the boolean
// state + its scroll listener are gone. This ref/CSS-var effect is
// the only scroll-driven mechanism left — no React state, no re-renders.
const COLLAPSE_DISTANCE = 180;

// Ease-out cubic: fast at the start of the collapse, settling in
// toward the end. Applied to the scroll ratio itself — there's no
// CSS transition to ease here (scroll position *is* the animation),
// so this is the correct place for a non-linear feel.
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
const stickyRootRef = useRef<HTMLDivElement>(null);
const collapseProgressRef = useRef(0);

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
const categories = menu?.categories ?? [];
const menuItems = menu?.menuItems ?? [];
  const currentOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentOrderIdRef.current = currentOrder?.id ?? null;
  }, [currentOrder?.id]);

  const fetchCurrentOrder = useCallback(
  async (orderId: string, showLoading = true) => {
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
  },
  [qrToken],
);

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
  }, [qrToken, fetchCurrentOrder]);
  useEffect(() => {
  if (categories.length === 0) return;

  const sections = categories
    .map((category) =>
      document.getElementById(`category-${category.id}`)
    )
    .filter(Boolean) as HTMLElement[];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveCategory(
            entry.target.id.replace("category-", "")
          );
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: "-120px 0px -60% 0px",
    }
  );

  sections.forEach((section) => observer.observe(section));

  return () => observer.disconnect();
}, [categories]);
// Continuous collapse progress, written straight to the DOM via ref —
// no React state, no re-renders on scroll. RestaurantHeader reads
// --collapse-progress directly from this.
useEffect(() => {
  let ticking = false;
  let previous = -1;

  const updateProgress = () => {
    const raw = Math.min(1, Math.max(0, window.scrollY / COLLAPSE_DISTANCE));
    const progress = easeOutCubic(raw);

    collapseProgressRef.current = progress;

    if (progress !== previous) {
      previous = progress;

      stickyRootRef.current?.style.setProperty(
        "--collapse-progress",
        progress.toString(),
      );

      // Discrete switch for the one thing that can't be a continuous
      // value (line-clamp 2 -> 1 in RestaurantHeader's title). Same
      // rAF loop, same ref, no extra listener, no React state.
      stickyRootRef.current?.classList.toggle("header-docked", progress > 0.8);
    }

    ticking = false;
  };

  updateProgress();

  const onScroll = () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(updateProgress);
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", onScroll);
  };
}, []);
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
const featuredItems = filteredMenuItems
  .filter((item) => item.isAvailable)
  .slice(0, 3);

  return (
    <main className="min-h-screen bg-stone-50 pb-32">
      {/*
        PHASE 1: single sticky root.
        RestaurantHeader, Search, and Categories now live inside ONE
        sticky container instead of three independently-sticky elements.
        NOTE: RestaurantHeader.tsx still has its own internal
        `sticky top-0 z-20` on its <header> — that's redundant now that
        this wrapper is already pinned, but harmless. It gets removed
        when we simplify RestaurantHeader.tsx in Phase 3.
      */}
      <div ref={stickyRootRef} className="sticky top-0 z-20">
        <RestaurantHeader
          restaurant={menu.restaurant}
          tableName={menu.table.name}
          cartItemCount={cartItemCount}
          currentOrder={currentOrder}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenOrder={() => setIsOrderDrawerOpen(true)}
        />

        <div
          className="border-b border-stone-200 bg-stone-50/90"
          style={{
            backdropFilter: "blur(calc(4px + var(--collapse-progress, 0) * 8px))",
            boxShadow: "0 4px 20px rgba(0,0,0,calc(var(--collapse-progress, 0) * 0.12))",
          }}
        >
          <div className="mx-auto max-w-5xl px-5 pb-4 pt-6 sm:px-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white px-5 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("all");

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition
                ${
                  activeCategory === "all"
                    ? "bg-orange-600 text-white"
                    : "border border-stone-200 bg-white text-stone-700 hover:bg-orange-50"
                }`}
              >
                All
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category.id);

                    document
                      .getElementById(`category-${category.id}`)
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition
                  ${
                    activeCategory === category.id
                      ? "bg-orange-600 text-white"
                      : "border border-stone-200 bg-white text-stone-700 hover:bg-orange-50 hover:border-orange-300"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
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

<div className="mx-auto max-w-5xl px-5 pt-10 pb-8 sm:px-8">
  {
 featuredItems.length >= 3 && !searchQuery.trim()
  && (
  <section className="mb-12">
    <div className="mb-5 flex items-end justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">
          Featured Menu
        </p>

        <h2 className="mt-1 text-2xl font-bold text-stone-900">
         Chef&apos;s Selection
        </h2>

        <p className="mt-1 text-sm text-stone-500">
          Chef&apos;s recommended dishes.
        </p>
      </div>
    </div>

<div className="grid gap-6 md:grid-cols-3">
  {featuredItems.map((item) => (
    <MenuCard
      key={`featured-${item.id}`}
      item={item}
      formatPrice={formatPrice}
      isFeatured
      quantity={
        cart.find((cartItem) => cartItem.id === item.id)?.quantity ?? 0
      }
      onAddToCart={() => addToCart(item)}
      onIncrease={() => addToCart(item)}
      onDecrease={() => {
        const current = cart.find(
          (cartItem) => cartItem.id === item.id,
        );

        if (current) {
          updateQuantity(item.id, current.quantity - 1);
        }
      }}
    />
  ))}
</div>
  </section>
)}

        {categories.map((category) => {
     const categoryItems = filteredMenuItems.filter(
  (item) =>
    item.categoryId === category.id &&
    !featuredItems.some((featured) => featured.id === item.id),
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

              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryItems.map((item) => (
                  <MenuCard
  key={item.id}
  item={item}
  formatPrice={formatPrice}
  quantity={
    cart.find((cartItem) => cartItem.id === item.id)?.quantity ?? 0
  }
  onAddToCart={() => addToCart(item)}
  onIncrease={() => addToCart(item)}
  onDecrease={() => {
    const current =
      cart.find((cartItem) => cartItem.id === item.id);

    if (current) {
      updateQuantity(item.id, current.quantity - 1);
    }
  }}
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

            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {uncategorizedItems.map((item) => (
                <MenuCard
  key={item.id}
  item={item}
  formatPrice={formatPrice}
  quantity={
    cart.find((cartItem) => cartItem.id === item.id)?.quantity ?? 0
  }
  onAddToCart={() => addToCart(item)}
  onIncrease={() => addToCart(item)}
  onDecrease={() => {
    const current =
      cart.find((cartItem) => cartItem.id === item.id);

    if (current) {
      updateQuantity(item.id, current.quantity - 1);
    }
  }}
/>
              ))}
            </div>
          </section>
        ) : null}

       {filteredMenuItems.length === 0 ? (
         <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
 <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
  <UtensilsCrossed className="h-10 w-10 text-orange-600" />
</div>

  <h3 className="mt-4 text-xl font-semibold text-stone-900">
    No dishes found
  </h3>

  <p className="mt-2 text-stone-600">
  No dishes matched your search.
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