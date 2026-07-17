import Link from "next/link";
import { ArrowRight, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#why-cafeos", label: "Why CafeOS" },
  { href: "#features", label: "Features" },
  { href: "#contact", label: "Contact" },
];

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="#top" className="flex items-center gap-2 text-stone-900" aria-label="CafeOS home">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm">
            <Coffee className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CafeOS</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-stone-900">
              {link.label}
            </Link>
          ))}
        </nav>

        <Button asChild size="sm" className="rounded-full bg-stone-900 text-white hover:bg-stone-700">
          <Link href="#contact" className="inline-flex items-center gap-2">
            Book a demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
