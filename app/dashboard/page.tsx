"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  IndianRupee,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { getOrders } from "@/services/order.service";
import type { RestaurantOrder } from "@/types/order";

function formatPrice(price: number | string): string {
  const numericPrice = Number(price);

  return Number.isFinite(numericPrice)
    ? `₹${numericPrice.toFixed(2)}`
    : "₹0.00";
}

function formatOrderReference(orderId: string): string {
  return `#${orderId.slice(-6).toUpperCase()}`;
}

function formatTime(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function isToday(date: string): boolean {
  const orderDate = new Date(date);
  const today = new Date();

  return (
    orderDate.getFullYear() === today.getFullYear() &&
    orderDate.getMonth() === today.getMonth() &&
    orderDate.getDate() === today.getDate()
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load dashboard data.";
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setIsLoading(true);
      setError("");

      const data = await getOrders();
      setOrders(data.orders);
    } catch (caughtError) {
      const message = getErrorMessage(caughtError);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const summary = useMemo(() => {
    const todayOrders = orders.filter((order) => isToday(order.createdAt));
    const activeOrders = orders.filter((order) =>
      ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(order.status),
    );
    const completedToday = todayOrders.filter(
      (order) => order.status === "COMPLETED",
    );
    const todayRevenue = completedToday.reduce(
      (total, order) => total + Number(order.total),
      0,
    );

    return {
      todayOrderCount: todayOrders.length,
      activeOrderCount: activeOrders.length,
      completedOrderCount: completedToday.length,
      todayRevenue,
      recentOrders: orders.slice(0, 5),
    };
  }, [orders]);

  return (
    <DashboardShell
      title="Overview"
      description="A live summary of your restaurant operations."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">
              Today&apos;s operations
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Track incoming orders and daily performance at a glance.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => void loadDashboard()}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center rounded-xl border border-stone-200 bg-stone-50 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-stone-600" />
          </div>
        ) : null}

        {error && !isLoading ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm text-red-700">{error}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={() => void loadDashboard()}
            >
              Try Again
            </Button>
          </div>
        ) : null}

        {!isLoading && !error ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-600">
                    Today&apos;s orders
                  </p>
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">
                  {summary.todayOrderCount}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  Orders created today
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-600">
                    Active orders
                  </p>
                  <Clock3 className="h-5 w-5 text-amber-600" />
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">
                  {summary.activeOrderCount}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  Pending, accepted, preparing, or ready
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-600">
                    Completed today
                  </p>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">
                  {summary.completedOrderCount}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  Orders completed today
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-600">
                    Today&apos;s revenue
                  </p>
                  <IndianRupee className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">
                  {formatPrice(summary.todayRevenue)}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  From completed orders
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-5">
                <div>
                  <h3 className="font-semibold text-stone-900">
                    Recent orders
                  </h3>
                  <p className="mt-1 text-sm text-stone-600">
                    Your five most recent customer orders.
                  </p>
                </div>

                <Link
                  href="/dashboard/orders"
                  className="inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800"
                >
                  View all orders
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {summary.recentOrders.length > 0 ? (
                <div className="divide-y divide-stone-100">
                  {summary.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-stone-900">
                          {formatOrderReference(order.id)} · {order.table.name}
                        </p>
                        <p className="mt-1 text-sm text-stone-600">
                          {order.items
                            .map(
                              (item) =>
                                `${item.menuItem.name} × ${item.quantity}`,
                            )
                            .join(", ")}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-stone-900">
                          {formatPrice(order.total)}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          {formatTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-sm text-stone-600">
                  No customer orders yet. Orders placed through a table QR will
                  appear here.
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </DashboardShell>
  );
}