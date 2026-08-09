"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useRelativeTime } from "@/hooks/use-relative-time";
import { formatRelativeTime } from "@/lib/utils";

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
const DASHBOARD_STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sky-100 text-sky-800",
  PREPARING: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function DashboardPage() {
  useRelativeTime();
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
  getStatusCount(dashboard.statusBreakdown, "PREPARING");

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
<DashboardShell title="Dashboard">
        <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">
              Today&apos;s Overview
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

        {isLoading ? <DashboardSkeleton /> : null}

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
              <div className="
  rounded-xl
  border
  border-stone-200
  bg-white
  p-5
  shadow-sm
  transition-all
  duration-300
  hover:-translate-y-1
  hover:border-amber-300
  hover:shadow-lg
"      >
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

              <div className="
  rounded-xl
  border
  border-stone-200
  bg-white
  p-5
  shadow-sm
  transition-all
  duration-300
  hover:-translate-y-1
  hover:border-amber-300
  hover:shadow-lg
"              >
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
                  Pending, accepted or preparing
                </p>
              </div>

              <div 
className="
  rounded-xl
  border
  border-stone-200
  bg-white
  p-5
  shadow-sm
  transition-all
  duration-300
  hover:-translate-y-1
  hover:border-amber-300
  hover:shadow-lg
"              >
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

              <div 
className="
  rounded-xl
  border
  border-stone-200
  bg-white
  p-5
  shadow-sm
  transition-all
  duration-300
  hover:-translate-y-1
  hover:border-amber-300
  hover:shadow-lg
"              >
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
className="
  flex
  flex-wrap
  items-center
  justify-between
  gap-3
  rounded-lg
  p-5
  transition-all
  duration-200
  hover:bg-stone-50
  hover:shadow-sm
"
                    >
                      <div>
                        <p className="text-sm font-semibold text-stone-900">
                          {formatOrderReference(order.id)} · {order.tableName}
                        </p>
<span
  className={`
    mt-2
    inline-flex
    rounded-full
    px-2.5
    py-1
    text-xs
    font-semibold
    ${DASHBOARD_STATUS_STYLES[order.status]}
  `}
>
  {order.status.charAt(0) +
    order.status.slice(1).toLowerCase()}
</span>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-stone-900">
                          {formatPrice(order.total)}
                        </p>

                        <p className="mt-1 text-sm text-stone-500">
{formatRelativeTime(order.createdAt)}

                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
               <div className="p-12 text-center">
  <div className="text-4xl">📦</div>

  <h3 className="mt-4 text-lg font-semibold text-stone-900">
    No recent orders
  </h3>

  <p className="mt-2 text-sm text-stone-500">
    Orders placed through the QR menu
    will appear here.
  </p>
</div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </DashboardShell>
  );
}