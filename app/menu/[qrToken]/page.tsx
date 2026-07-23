"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Search,
  SlidersHorizontal,
  Coffee,
  Pizza,
  Sandwich,
  IceCreamCone,
  CupSoda,
  Soup,
  UtensilsCrossed,
} from "lucide-react";
import RestaurantHeader from "./components/RestaurantHeader";
import { io } from "socket.io-client";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

// Best-effort icon per category name — purely cosmetic, falls back to
// a generic utensils icon. Doesn't touch the API contract.
function getCategoryIcon(name: string) {
  const key = name.toLowerCase();

  if (key.includes("coffee") || key.includes("espresso")) return Coffee;
  if (key.includes("pizza")) return Pizza;
  if (key.includes("burger")) return Sandwich;
  if (key.includes("dessert") || key.includes("cake") || key.includes("ice"))
    return IceCreamCone;
  if (key.includes("tea") || key.includes("juice") || key.includes("drink"))
    return CupSoda;
  if (key.includes("soup") || key.includes("pasta")) return Soup;

  return UtensilsCrossed;
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
  // Cosmetic only: which chip lights up while the user free-scrolls
  // through the "All" view. Deliberately separate from activeCategory
  // so scrolling never filters/hides sections — only a tap does that.
  const [scrollSpyCategory, setScrollSpyCategory] = useState<string | null>(
    null,
  );

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
  const popularSectionRef = useRef<HTMLDivElement | null>(null);
  const menuSectionRef = useRef<HTMLDivElement | null>(null);

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

  // Scroll-spy: only runs while browsing the unfiltered "All" view.
  // The moment a chip is tapped (activeCategory !== "all"), only that
  // category's section exists in the DOM anyway, so this effect backs
  // off entirely rather than fighting the filter.
  useEffect(() => {
    if (activeCategory !== "all" || categories.length === 0) {
      return;
    }

    const sections = categories
      .map((category) => document.getElementById(`category-${category.id}`))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setScrollSpyCategory(entry.target.id.replace("category-", ""));
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-160px 0px -60% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [categories, activeCategory]);

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
      cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0),
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
    setCart((currentCart) => currentCart.filter((item) => item.id !== menuItemId));
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
        await safelyReadJson<ApiResponse<CurrentOrder> | CurrentOrder>(response);

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
      <main className="flex min-h-screen items-center justify-center bg-[#0F1115] px-6">
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
          <p>Loading menu...</p>
        </div>
      </main>
    );
  }

  if (error || !menu) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0F1115] px-6">
        <section className="w-full max-w-md rounded-3xl border border-red-500/20 bg-[#171A20] p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-400">
            Menu unavailable
          </p>

          <h1 className="mt-3 text-2xl font-semibold text-neutral-100">
            We could not open this table menu
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
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

  const uncategorizedItems = filteredMenuItems.filter((item) => !item.categoryId);
  const featuredItems = filteredMenuItems
    .filter((item) => item.isAvailable)
    .slice(0, 6);

  // When a specific chip is selected, only that category's section
  // renders. "all" shows everything, same as before.
  const filteredCategories =
    activeCategory === "all"
      ? categories
      : categories.filter((category) => category.id === activeCategory);

  const showPopular =
    activeCategory === "all" && featuredItems.length >= 3 && !searchQuery.trim();

  return (
    <main className="min-h-screen bg-[#0F1115] pb-32">
      <style>{`
        @keyframes menuFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Sticky root: header + search + categories. No hero, no
          collapsing — every offset below is a fixed spacing value. */}
      <div className="sticky top-0 z-20">
        <RestaurantHeader
          restaurant={menu.restaurant}
          tableName={menu.table.name}
          cartItemCount={cartItemCount}
          currentOrder={currentOrder}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenOrder={() => setIsOrderDrawerOpen(true)}
          onNavigateMenu={() => {
            setActiveCategory("all");
            setSearchQuery("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigatePopular={() => {
            setActiveCategory("all");
            setSearchQuery("");
            requestAnimationFrame(() => {
              popularSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            });
          }}
        />

        <div className="border-b border-white/5 bg-[#0F1115]/95 shadow-sm backdrop-blur-xl">
          {/* Header → Search: 20px */}
          <div className="mx-auto max-w-5xl px-5 pb-4 pt-5 sm:px-8">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-neutral-500" />

              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-[#171A20] py-3.5 pl-11 pr-11 text-neutral-100 shadow-inner outline-none transition placeholder:text-neutral-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
              />

              <button
                type="button"
                aria-label="Filters"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/5 hover:text-neutral-200"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Search → Categories: 16px */}
            <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition active:scale-95 ${
                  activeCategory === "all"
                    ? "bg-orange-500 text-white"
                    : "bg-[#171A20] text-neutral-300 hover:bg-white/10"
                }`}
              >
                All
              </button>

              {categories.map((category) => {
                const Icon = getCategoryIcon(category.name);
                // Selected explicitly by tap, OR — while browsing the
                // unfiltered All view — currently in view per scroll-spy.
                // Either way this is display-only; it never affects
                // filteredCategories.
                const isActive =
                  activeCategory === category.id ||
                  (activeCategory === "all" && scrollSpyCategory === category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category.id);
                      setSearchQuery("");
                      menuSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition active:scale-95 ${
                      isActive
                        ? "bg-orange-500 text-white"
                        : "bg-[#171A20] text-neutral-300 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {orderMessage ? (
        <div className="mx-auto mt-5 max-w-5xl px-5 sm:px-8">
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {orderMessage}
          </div>
        </div>
      ) : null}

      {orderError ? (
        <div className="mx-auto mt-5 max-w-5xl px-5 sm:px-8">
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {orderError}
          </div>
        </div>
      ) : null}

      {/* Categories → Popular: 28px */}
      <div className="mx-auto max-w-5xl px-5 pt-7 pb-8 sm:px-8">
        {showPopular && (
          <section
            ref={popularSectionRef}
            className="mb-9 scroll-mt-48 animate-[menuFadeIn_0.25s_ease-out]"
          >
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
                  Popular Today
                </p>
                <h2 className="mt-1 text-[26px] font-bold leading-tight text-neutral-100">
                  Most Ordered Today
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Customer favourites
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  menuSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="shrink-0 text-sm font-semibold text-orange-400 transition hover:text-orange-300"
              >
                View All →
              </button>
            </div>

            <div className="-mx-5 flex gap-5 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
              {featuredItems.map((item) => (
                <div key={`featured-${item.id}`} className="w-[190px] shrink-0">
                  <MenuCard
                    item={item}
                    formatPrice={formatPrice}
                    isFeatured
                    quantity={
                      cart.find((cartItem) => cartItem.id === item.id)?.quantity ??
                      0
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
                </div>
              ))}
            </div>
          </section>
        )}

        <div
          key={`${activeCategory}-${searchQuery}`}
          ref={menuSectionRef}
          className="scroll-mt-48 animate-[menuFadeIn_0.25s_ease-out]"
        >
          {filteredCategories.map((category) => {
            const categoryItems = filteredMenuItems.filter((item) => {
              if (item.categoryId !== category.id) return false;

              // Only hide items that are already shown in the Popular
              // Today rail when that rail is actually visible (the
              // "All" view). When a specific category chip is
              // selected, Popular Today is hidden, so every matching
              // item — featured or not — must show up here.
              if (showPopular) {
                return !featuredItems.some((featured) => featured.id === item.id);
              }

              return true;
            });

            if (categoryItems.length === 0) {
              return null;
            }

            return (
              <section
                key={category.id}
                id={`category-${category.id}`}
                className="mb-9 scroll-mt-48"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-100">
                    {category.name}
                  </h2>
                  <span className="flex items-center gap-1 text-sm font-medium text-orange-400">
                    {categoryItems.length} Items →
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {categoryItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      formatPrice={formatPrice}
                      quantity={
                        cart.find((cartItem) => cartItem.id === item.id)
                          ?.quantity ?? 0
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
            );
          })}

          {activeCategory === "all" && uncategorizedItems.length > 0 ? (
            <section className="mb-9">
              <h2 className="mb-4 text-xl font-bold text-neutral-100">
                More items
              </h2>

              <div className="flex flex-col gap-3">
                {uncategorizedItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    formatPrice={formatPrice}
                    quantity={
                      cart.find((cartItem) => cartItem.id === item.id)?.quantity ??
                      0
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
          ) : null}

          {filteredMenuItems.filter(
            (item) => activeCategory === "all" || item.categoryId === activeCategory,
          ).length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#171A20] p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10">
                <UtensilsCrossed className="h-10 w-10 text-orange-400" />
              </div>

              <h3 className="mt-4 text-xl font-semibold text-neutral-100">
                No dishes found
              </h3>

              <p className="mt-2 text-neutral-400">
                {searchQuery.trim()
                  ? "No dishes matched your search."
                  : "No dishes found in this category."}
              </p>
            </div>
          ) : null}
        </div>
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