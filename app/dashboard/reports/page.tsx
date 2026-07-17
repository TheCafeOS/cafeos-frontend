import Link from "next/link";
import { BarChart3, ArrowLeft } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <DashboardShell
      title="Reports"
      description="Business analytics and insights."
    >
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <BarChart3 className="h-8 w-8 text-amber-600" />
          </div>

          <h2 className="mt-6 text-2xl font-semibold text-stone-900">
            Reports
          </h2>

          <p className="mt-3 text-stone-600 leading-7">
            View sales analytics, customer trends, and business performance reports.
          </p>

          <div className="mt-8 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6">
            <p className="font-medium text-stone-900">
              Coming Soon
            </p>

            <p className="mt-2 text-sm text-stone-500">
              This feature is coming soon.
            </p>
          </div>

          <Button asChild className="mt-8">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}