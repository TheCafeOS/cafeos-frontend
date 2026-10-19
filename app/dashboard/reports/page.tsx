"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Clock3,
  IndianRupee,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useRelativeTime } from "@/hooks/use-relative-time";
import { useOwnerOrderSocket } from "@/hooks/use-owner-order-socket";
import { formatRelativeTime } from "@/lib/utils";
import { getDashboardSummary } from "@/services/dashboard.service";
import type {
  DashboardStatusCount,
  DashboardSummary,
} from "@/types/dashboard";

const STATUS_LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sky-100 text-sky-800",
  PREPARING: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
} as const;

function formatPrice(value: number | string): string {
  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? `₹${numericValue.toFixed(2)}`
    : "₹0.00";
}

function getStatusCount(
  statusBreakdown: DashboardStatusCount[],
  status: DashboardStatusCount["status"],
): number {
  return statusBreakdown.find((item) => item.status === status)?.count ?? 0;
}

export default function ReportsPage() {
  useRelativeTime();

  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (showToast = true) => {
    try {
      setIsLoading(true);
      setError("");

      const summary = await getDashboardSummary();
      setDashboard(summary);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load report data.";

      setError(message);

      if (showToast) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard(false);
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
        todayRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        activeOrders: 0,
      };
    }

    const activeOrders =
      getStatusCount(dashboard.statusBreakdown, "PENDING") +
      getStatusCount(dashboard.statusBreakdown, "CONFIRMED") +
      getStatusCount(dashboard.statusBreakdown, "PREPARING");

    return {
      todayRevenue: dashboard.today.totalRevenue,
      totalOrders: dashboard.today.totalOrders,
      averageOrderValue:
        dashboard.today.totalOrders > 0
          ? dashboard.today.totalRevenue / dashboard.today.totalOrders
          : 0,
      activeOrders,
    };
  }, [dashboard]);

  return (
    <DashboardShell
      title="Reports"
      description="Business analytics and recent activity for the current day."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">
              Performance snapshot
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-stone-900">
              {dashboard?.today.date ?? "Today"}
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

        {isLoading ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-500 shadow-sm">
            Loading report data...
          </div>
        ) : null}

        {!isLoading && !error && dashboard ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-600">Revenue</p>
                  <IndianRupee className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-4 text-3xl font-semibold text-stone-900">
                  {formatPrice(metrics.todayRevenue)}
                </p>
                <p className="mt-1 text-sm text-stone-500">Total sales today</p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-600">Orders</p>
                  <ShoppingCart className="h-5 w-5 text-amber-600" />
                </div>
                <p className="mt-4 text-3xl font-semibold text-stone-900">
                  {metrics.totalOrders}
                </p>
                <p className="mt-1 text-sm text-stone-500">Orders created today</p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-600">Avg. order</p>
                  <TrendingUp className="h-5 w-5 text-sky-600" />
                </div>
                <p className="mt-4 text-3xl font-semibold text-stone-900">
                  {formatPrice(metrics.averageOrderValue)}
                </p>
                <p className="mt-1 text-sm text-stone-500">Per-order revenue</p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-600">Active</p>
                  <Clock3 className="h-5 w-5 text-violet-600" />
                </div>
                <p className="mt-4 text-3xl font-semibold text-stone-900">
                  {metrics.activeOrders}
                </p>
                <p className="mt-1 text-sm text-stone-500">Pending / confirmed / preparing</p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">Recent orders</h3>
                    <p className="text-sm text-stone-500">Latest restaurant activity</p>
                  </div>

                  <BarChart3 className="h-5 w-5 text-stone-400" />
                </div>

                {dashboard.recentOrders.length === 0 ? (
                  <div className="mt-6 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-500">
                    No orders have been placed for this restaurant yet.
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {dashboard.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium text-stone-900">
                            {order.tableName ? `Table ${order.tableName}` : "Walk-in order"}
                          </p>
                          <p className="text-sm text-stone-500">
                            {formatRelativeTime(order.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                          >
                            {STATUS_LABELS[order.status]}
                          </span>
                          <span className="font-semibold text-stone-900">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-stone-900">Status breakdown</h3>

                <div className="mt-5 space-y-3">
                  {Object.entries(STATUS_LABELS).map(([status, label]) => {
                    const count = getStatusCount(dashboard.statusBreakdown, status as DashboardStatusCount["status"]);

                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2"
                      >
                        <span className="flex items-center gap-2 text-sm text-stone-700">
                          <span className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_STYLES[status as keyof typeof STATUS_STYLES]}`} />
                          {label}
                        </span>
                        <span className="font-semibold text-stone-900">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        ) : null}

        <div className="pt-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}