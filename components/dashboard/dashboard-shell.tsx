"use client";

import { useState } from "react";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type DashboardShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardShell({ title, description, children, className }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900">
      <div className={cn("fixed inset-0 z-30 bg-stone-950/50 lg:hidden", mobileNavOpen ? "block" : "hidden")}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-stone-200 bg-stone-50/95 shadow-lg transition-transform lg:static lg:w-72 lg:translate-x-0 lg:shadow-none",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <DashboardSidebar />
      </div>

      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardHeader title={title} description={description} onMenuClick={() => setMobileNavOpen(true)} />
        <DashboardContent className={className}>{children}</DashboardContent>
      </div>
    </div>
  );
}
