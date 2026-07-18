import Link from "next/link";
import { ArrowRight, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#features", label: "Features" },
  { href: "#why-cafeos", label: "Why CafeOS" },
  { href: "#contact", label: "Contact" },
];

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="#top"
          aria-label="CafeOS Home"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm">
            <Coffee className="h-5 w-5" />
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-lg font-semibold tracking-tight text-stone-900">
              CafeOS
            </span>
            <span className="text-xs text-stone-500">
              Restaurant Operations Platform
            </span>
          </div>
        </Link>

        <nav
          aria-label="Primary Navigation"
          className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Link href="/login">Login</Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="rounded-full bg-stone-900 px-5 text-white hover:bg-stone-800"
          >
            <Link href="#contact" className="inline-flex items-center gap-2">
              Contact Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Button
            asChild
            size="sm"
            className="rounded-full bg-stone-900 text-white"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}