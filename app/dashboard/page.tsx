import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardPage() {
  return (
    <DashboardShell title="Overview" description="A calm workspace for daily operations.">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-700">Dashboard</p>
        <h2 className="text-3xl font-semibold tracking-tight text-stone-900">Your operations overview</h2>
        <p className="max-w-2xl text-base leading-8 text-stone-600">
          This dashboard shell provides the structure for future operational views without introducing any business data or API integration.
        </p>
      </div>
    </DashboardShell>
  );
}
