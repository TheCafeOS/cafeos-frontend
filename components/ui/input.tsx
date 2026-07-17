import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };