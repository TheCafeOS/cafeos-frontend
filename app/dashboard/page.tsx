"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useOwnerOrderSocket } from "@/hooks/use-owner-order-socket";
import { getDashboardSummary } from "@/services/dashboard.service";
import type {
  DashboardStatusCount,
  DashboardSummary,
} from "@/types/dashboard";

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

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to load dashboard data.";
}

function getStatusCount(
  statusBreakdown: DashboardStatusCount[],
  status: DashboardStatusCount["status"],
): number {
  return statusBreakdown.find((item) => item.status === status)?.count ?? 0;
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (showToast = true) => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getDashboardSummary();
      setDashboard(data);
    } catch (caughtError) {
      const message = getErrorMessage(caughtError);

      setError(message);

      if (showToast) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadDashboard(false);
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, [loadDashboard]);
  useOwnerOrderSocket({
    onOrderCreated: () => {
      void loadDashboard(false);
    },
    onOrderUpdated: () => {
      void loadDashboard(false);
    },
  });

  const metrics = useMemo(() => {
    if (!dashboard) {
      return {
        todayOrderCount: 0,
        activeOrderCount: 0,
        completedOrderCount: 0,
        todayRevenue: 0,
        recentOrders: [],
      };
    }

    const activeOrderCount =
      getStatusCount(dashboard.statusBreakdown, "PENDING") +
      getStatusCount(dashboard.statusBreakdown, "CONFIRMED") +
      getStatusCount(dashboard.statusBreakdown, "PREPARING") +
      getStatusCount(dashboard.statusBreakdown, "READY");

    return {
      todayOrderCount: dashboard.today.totalOrders,
      activeOrderCount,
      completedOrderCount: getStatusCount(
        dashboard.statusBreakdown,
        "COMPLETED",
      ),
      todayRevenue: dashboard.today.totalRevenue,
      recentOrders: dashboard.recentOrders,
    };
  }, [dashboard]);

  return (
    <DashboardShell title="Overview">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">
              Today&apos;s operations
            </h2>
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

        {!isLoading && !error && dashboard ? (
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
                  {metrics.todayOrderCount}
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
                  {metrics.activeOrderCount}
                </p>

                <p className="mt-1 text-sm text-stone-500">
                  Pending, accepted, preparing, or ready
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-600">
                    Completed orders
                  </p>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>

                <p className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">
                  {metrics.completedOrderCount}
                </p>

                <p className="mt-1 text-sm text-stone-500">
                  All completed orders
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
                  {formatPrice(metrics.todayRevenue)}
                </p>

                <p className="mt-1 text-sm text-stone-500">
                  Revenue from today&apos;s orders
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-5">
                <div>
                  <h3 className="font-semibold text-stone-900">
                    Recent orders
                  </h3>
                </div>

                <Link
                  href="/dashboard/orders"
                  className="inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800"
                >
                  View all orders
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {metrics.recentOrders.length > 0 ? (
                <div className="divide-y divide-stone-100">
                  {metrics.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-stone-900">
                          {formatOrderReference(order.id)} · {order.tableName}
                        </p>

                        <p className="mt-1 text-sm text-stone-600">
                          {order.status.charAt(0) +
                            order.status.slice(1).toLowerCase()}
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