import Link from "next/link";
import { Coffee } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="border-t border-stone-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="#top" className="flex items-center gap-2 text-stone-900" aria-label="CafeOS home">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white">
            <Coffee className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CafeOS</span>
        </Link>
        <p className="text-sm text-stone-600">
          © 2026 CafeOS. Built for sharper service and calmer operations.
        </p>
      </div>
    </footer>
  );
}
