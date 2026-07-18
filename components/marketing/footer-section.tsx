import Link from "next/link";
import { Coffee, Mail } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="border-t border-stone-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Link
            href="#top"
            className="flex items-center gap-2 text-stone-900"
            aria-label="CafeOS home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white">
              <Coffee className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight">CafeOS</p>
              <p className="text-sm text-stone-500">
                Restaurant Operations Platform
              </p>
            </div>
          </Link>

          <p className="max-w-sm text-sm leading-6 text-stone-600">
            Helping cafés and restaurants manage orders, tables, kitchen
            operations, and inventory from one platform.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <Link
            href="mailto:cafeos.app@gmail.com"
            className="flex items-center gap-2 text-stone-600 transition hover:text-stone-900"
          >
            <Mail className="h-4 w-4" />
            cafeos.app@gmail.com
          </Link>

          <p className="text-stone-500">
            © 2026 CafeOS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}