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
    // overflow-x-hidden here is a safety net: even if something deep in
    // the tree ever refuses to shrink again, the page itself can no
    // longer scroll sideways because of it — worst case that one element
    // gets clipped instead of dragging the whole viewport wider.
    <div className="flex min-h-screen w-full overflow-x-hidden bg-stone-50 text-stone-900">
      <div
        className={cn("fixed inset-0 z-30 bg-stone-950/50 lg:hidden", mobileNavOpen ? "block" : "hidden")}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-stone-200 bg-stone-50/95 shadow-lg transition-transform lg:static lg:w-72 lg:translate-x-0 lg:shadow-none",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <DashboardSidebar mobile />
      </div>

      {/*
        THE ACTUAL FIX: this is a flex item inside the row above. Flex
        items default to min-width: auto, meaning if any descendant ever
        has content that can't shrink, this column refuses to shrink
        below it and the entire page grows past the viewport instead of
        wrapping/clipping — which is exactly what the screenshots showed
        (the header title bar and every card sliced at the same edge on
        every device width). min-w-0 overrides that default and lets
        this column, and everything in it, actually respect 100dvw.
      */}
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
        <DashboardHeader title={title} description={description} onMenuClick={() => setMobileNavOpen(true)} />
        <DashboardContent className={cn("min-w-0", className)}>{children}</DashboardContent>
      </div>
    </div>
  );
}