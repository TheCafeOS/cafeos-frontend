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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

type SortOption = "popular" | "price-asc" | "price-desc" | "az" | "za";

type MenuFilters = {
  availableOnly: boolean;
  sortBy: SortOption;
};

const DEFAULT_FILTERS: MenuFilters = {
  availableOnly: false,
  sortBy: "popular",
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
];

function isDefaultFilters(filters: MenuFilters): boolean {
  return (
    filters.availableOnly === DEFAULT_FILTERS.availableOnly &&
    filters.sortBy === DEFAULT_FILTERS.sortBy
  );
}

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

// Decides whether the filter control should render as a desktop Popover
// or a mobile bottom Sheet. We mount only ONE of the two at a time rather
// than CSS-hiding the other, because SheetContent/PopoverContent both
// render into a portal at document.body — a `hidden` wrapper around the
// trigger would not stop the hidden variant's content from still popping
// up at the body root if it were ever opened. Defaults to false (mobile)
// until the effect runs on mount, matching the shadcn/ui pattern for
// responsive dialog/drawer switching.
function useIsDesktopViewport(breakpointPx = 768): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpointPx}px)`);

   requestAnimationFrame(() => {
  setIsDesktop(mediaQuery.matches);
});

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [breakpointPx]);

  return isDesktop;
}

// Shared body of the filter UI — identical whether it's rendered inside
// the mobile Sheet or the desktop Popover. Purely controlled: it holds no
// state of its own, it just reflects `draftFilters` and reports changes
// upward via `onChange`. Nothing here touches the applied filters.
function MenuFilterForm({
  draftFilters,
  onChange,
}: {
  draftFilters: MenuFilters;
  onChange: (next: MenuFilters) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
          Availability
        </p>

        <div
          role="button"
          tabIndex={0}
          onClick={() =>
            onChange({
              ...draftFilters,
              availableOnly: !draftFilters.availableOnly,
            })
          }
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onChange({
                ...draftFilters,
                availableOnly: !draftFilters.availableOnly,
              });
            }
          }}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
            draftFilters.availableOnly
              ? "border-orange-500/40 bg-orange-500/10"
              : "border-white/5 bg-[#0F1115] hover:bg-white/5"
          }`}
        >
          {/* pointer-events-none: clicks are handled by the row above so
              a single tap can't fire both the row handler and Radix's
              own click handling and cancel itself out. */}
          <Checkbox
            checked={draftFilters.availableOnly}
            className="pointer-events-none border-white/20 data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
          />
          <span className="text-sm font-medium text-neutral-200">
            Available Only
          </span>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
          Sorting
        </p>

        <RadioGroup value={draftFilters.sortBy} className="flex flex-col gap-2">
          {SORT_OPTIONS.map((option) => (
            <div
              key={option.value}
              role="button"
              tabIndex={0}
              onClick={() => onChange({ ...draftFilters, sortBy: option.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onChange({ ...draftFilters, sortBy: option.value });
                }
              }}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                draftFilters.sortBy === option.value
                  ? "border-orange-500/40 bg-orange-500/10"
                  : "border-white/5 bg-[#0F1115] hover:bg-white/5"
              }`}
            >
              <RadioGroupItem
                value={option.value}
                className="pointer-events-none border-white/20 text-orange-500"
              />
              <span className="text-sm font-medium text-neutral-200">
                {option.label}
              </span>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

function MenuFilterFooter({
  onReset,
  onApply,
}: {
  onReset: () => void;
  onApply: () => void;
}) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onReset}
        className="flex-1 rounded-xl border border-white/10 bg-[#0F1115] py-3 text-sm font-semibold text-neutral-200 transition hover:bg-white/10 active:scale-95"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={onApply}
        className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 active:scale-95"
      >
        Apply
      </button>
    </div>
  );
}

export default function CustomerMenuPage({ params }: MenuPageProps) {
  const [menu, setMenu] = useState<PublicMenuResponse | null>(null);
  const [qrToken, setQrToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showFullMenu, setShowFullMenu] = useState(false);

  // Filters: `appliedFilters` is what actually affects the rendered menu.
  // `draftFilters` is the in-progress edit shown inside the open sheet/
  // popover — it only ever flows into `appliedFilters` via Apply, so
  // opening the filter UI or fiddling with it never changes the menu on
  // its own, and closing without Apply just discards the draft.
  const [appliedFilters, setAppliedFilters] = useState<MenuFilters>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<MenuFilters>(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
  const isDesktopFilterViewport = useIsDesktopViewport();

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

  // Single source of truth for "go back to the unfiltered All view".
  //
  // showFullMenu defaults to true because "All" (the chip, or "View All")
  // means "show me the complete menu" — every item in every category,
  // with no items pulled out into a Popular Today rail. The homepage
  // ("Menu" / "Popular" in the header) is the one exception: it wants
  // the promo rail, so it explicitly passes showFullMenu: false.
  function goToAllCategories(options: { showFullMenu?: boolean } = {}) {
    const { showFullMenu: nextShowFullMenu = true } = options;

    setShowFullMenu(nextShowFullMenu);
    setActiveCategory("all");
    setSearchQuery("");
  }

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

  // Search + availability filter + sort, computed client-side and
  // memoized together since they always need to be recomputed as a unit.
  // Never mutates menuItems: search produces a new filtered array, and
  // sorting operates on a shallow copy of that result, not the original.
  const filteredMenuItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const searched = menuItems.filter((item) => {
      if (!query) return true;

      const categoryName =
        categories.find((category) => category.id === item.categoryId)?.name ??
        "";

      return (
        item.name.toLowerCase().includes(query) ||
        (item.description ?? "").toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query)
      );
    });

    const availabilityFiltered = appliedFilters.availableOnly
      ? searched.filter((item) => item.isAvailable !== false)
      : searched;

    const sorted = [...availabilityFiltered];

    switch (appliedFilters.sortBy) {
      case "price-asc":
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "az":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "popular":
      default:
        // "Popular" is the natural order the backend already returns —
        // no client-side reordering needed.
        break;
    }

    return sorted;
  }, [menuItems, categories, searchQuery, appliedFilters]);

  const hasActiveFilters = !isDefaultFilters(appliedFilters);

  // Opening the sheet/popover always resyncs the draft to whatever is
  // currently applied. That's what makes "closing without Apply discards
  // changes" work: any unsaved edits from a previous open simply get
  // overwritten the next time it's opened, instead of lingering.
  function handleFilterOpenChange(open: boolean) {
    if (open) {
      setDraftFilters(appliedFilters);
    }

    setIsFilterOpen(open);
  }

  function handleApplyFilters() {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  }

  function handleResetFilters() {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
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
  !showFullMenu &&
  activeCategory === "all" &&
  featuredItems.length >= 3 &&
  !searchQuery.trim();
  return (
   <main className="min-h-screen overflow-x-hidden bg-[#0F1115] pb-32">
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
            goToAllCategories({ showFullMenu: false });

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
          onNavigatePopular={() => {
            goToAllCategories({ showFullMenu: false });
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
          <div className="mx-auto max-w-5xl px-4 pb-3 pt-4 sm:px-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-neutral-500" />

              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-[#171A20] py-3 pl-11 pr-11 text-neutral-100 shadow-inner outline-none transition placeholder:text-neutral-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
              />

              {isDesktopFilterViewport ? (
                <Popover open={isFilterOpen} onOpenChange={handleFilterOpenChange}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Filters"
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/5 hover:text-neutral-200"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      {hasActiveFilters ? (
                        <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-orange-500" />
                      ) : null}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="end"
                    sideOffset={12}
                    className="w-80 rounded-2xl border-white/10 bg-[#171A20] p-5 text-neutral-100 shadow-xl"
                  >
                    <p className="mb-4 text-sm font-semibold text-neutral-100">
                      Filter &amp; Sort
                    </p>

                    <MenuFilterForm
                      draftFilters={draftFilters}
                      onChange={setDraftFilters}
                    />

                    <div className="mt-6">
                      <MenuFilterFooter
                        onReset={handleResetFilters}
                        onApply={handleApplyFilters}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Sheet open={isFilterOpen} onOpenChange={handleFilterOpenChange}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Filters"
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/5 hover:text-neutral-200"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      {hasActiveFilters ? (
                        <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-orange-500" />
                      ) : null}
                    </button>
                  </SheetTrigger>

                  <SheetContent
                    side="bottom"
                    className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-white/10 bg-[#171A20] text-neutral-100"
                  >
                    <SheetHeader className="text-left">
                      <SheetTitle className="text-neutral-100">
                        Filter &amp; Sort
                      </SheetTitle>
                    </SheetHeader>

                    <div className="mt-4">
                      <MenuFilterForm
                        draftFilters={draftFilters}
                        onChange={setDraftFilters}
                      />
                    </div>

                    <div className="mt-6 pb-2">
                      <MenuFilterFooter
                        onReset={handleResetFilters}
                        onApply={handleApplyFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>

            {/* Search → fCategories: 16px */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                type="button"
                onClick={() => {
                  goToAllCategories();

                  requestAnimationFrame(() => {
                    menuSectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  });
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
                const isActive = activeCategory === category.id;

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
        <div className="mx-auto mt-5 max-w-5xl px-4 sm:px-6 lg:px-8">
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
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
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
                onClick={() => {
                  goToAllCategories();

                  requestAnimationFrame(() => {
                    menuSectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  });
                }}
                className="shrink-0 text-sm font-semibold text-orange-400 transition hover:text-orange-300"
              >
                View All →
              </button>
            </div>

<div className="-mx-5 flex gap-5 overflow-x-auto scrollbar-hide px-5 pb-2 sm:-mx-8 sm:px-8">              {featuredItems.map((item) => (
                <div key={`featured-${item.id}`} className="w-[170px] xs:w-[180px] sm:w-[190px] shrink-0">
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
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(category.id);
                      setSearchQuery("");
                      requestAnimationFrame(() => {
                        menuSectionRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      });
                    }}
                    className="flex items-center gap-1 text-sm font-medium text-orange-400 transition hover:text-orange-300"
                  >
                    {categoryItems.length} Items →
                  </button>
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
                  : hasActiveFilters
                    ? "No dishes matched your filters."
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