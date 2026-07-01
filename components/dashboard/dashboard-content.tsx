import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type DashboardContentProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardContent({ children, className }: DashboardContentProps) {
  return <div className={cn("flex-1 bg-stone-50 p-4 sm:p-6 lg:p-8", className)}>{children}</div>;
}
