import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/section";

const highlights = [
  "Customers order by scanning a QR code",
  "Live updates for your kitchen and staff",
  "Manage tables, menus, and stock from one dashboard",
];

export function HeroSection() {
  return (
    <Section
      id="top"
      className="bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_45%)] py-16 sm:py-20 lg:py-24"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
            <Sparkles className="h-4 w-4" />
            Built for cafés and restaurants
          </div>

          <div className="space-y-5">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
              Run your entire café from one platform.
            </h1>

            <p className="max-w-2xl text-xl leading-8 text-stone-600">
              From QR ordering and table management to live kitchen updates and
              inventory, CafeOS keeps every part of your restaurant connected so
              your team can focus on serving customers—not coordinating systems.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-orange-500 text-white hover:bg-orange-600"
            >
              <Link href="/scan" className="inline-flex items-center gap-2">
                Scan QR Menu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              className="rounded-full bg-amber-600 text-white hover:bg-amber-700"
            >
              <Link href="#contact" className="inline-flex items-center gap-2">
                Contact Team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ul className="space-y-3 text-sm text-stone-700 sm:text-base">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_30px_90px_-25px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50 px-5 py-3">
            <span className="h-3 w-3 rounded-full bg-stone-300" />
            <span className="h-3 w-3 rounded-full bg-stone-300" />
            <span className="h-3 w-3 rounded-full bg-stone-300" />

            <span className="ml-4 text-sm font-medium text-stone-500">
              Dashboard Preview
            </span>
          </div>

          <Image
            src="/marketing-dashboard.png"
            alt="CafeOS dashboard preview"
            width={1600}
            height={1000}
            priority
            quality={100}
            className="h-auto w-full rounded-b-3xl"
          />
        </div>
      </div>
    </Section>
  );
}