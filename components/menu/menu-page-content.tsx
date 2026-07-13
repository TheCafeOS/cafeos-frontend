"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

import { MenuContent } from "@/components/menu/menu-content";
import { CartSidebar } from "@/components/menu/cart-sidebar";
import {
  fetchPublicMenu,
  type PublicMenuResponse,
} from "@/services/public-menu.service";

import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MenuPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qrToken = searchParams.get("qr");

  const [menu, setMenu] = useState<PublicMenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!qrToken) {
      setError("No QR code provided");
      setLoading(false);
      return;
    }

    const loadMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchPublicMenu(qrToken);
        setMenu(data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;

          if (status === 404) {
            setError("Invalid QR code");
          } else if (status === 403) {
            setError("This table is currently inactive");
          } else {
            setError("Failed to load menu. Please try again.");
          }
        } else {
          setError("Something went wrong. Please try again.");
        }

        setMenu(null);
      } finally {
        setLoading(false);
      }
    };

    void loadMenu();
  }, [qrToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-stone-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            Unable to Load Menu
          </h1>

          <p className="text-stone-600 mb-6">{error}</p>

          <Button
            onClick={() => router.push("/")}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!menu) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                {menu.restaurant.name}
              </h1>

              <p className="text-sm text-stone-600">
                Table: {menu.table.name}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-stone-200 text-stone-600"
            >
              Exit
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl">
            <MenuContent
              categories={menu.categories}
              menuItems={menu.menuItems}
            />
          </div>
        </div>

        {/* Desktop Cart */}
        <aside className="hidden lg:flex lg:w-80 border-l border-stone-200 flex-col">
          <CartSidebar
            onCheckout={() => {
              // TODO: Implement checkout flow
            }}
          />
        </aside>
      </div>

      {/* Mobile Cart Button */}
      <div className="fixed bottom-4 right-4 lg:hidden">
        <Button
          onClick={() => {
            // TODO: Show mobile cart modal
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 shadow-lg hover:bg-orange-600"
        >
          🛒
        </Button>
      </div>
    </div>
  );
}