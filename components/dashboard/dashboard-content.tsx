import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type DashboardContentProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardContent({
  children,
  className,
}: DashboardContentProps) {
  return (
    <div className="min-w-0 flex-1 overflow-x-hidden bg-stone-50">
      <div
        className={cn(
          "mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}