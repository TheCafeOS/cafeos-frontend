import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/section";

const highlights = [
  "Run service, kitchen, and front desk from one system",
  "Keep every table, order, and stock movement in sync",
  "Act faster with live performance insights",
];

export function HeroSection() {
  return (
    <Section id="top" className="bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_45%)] py-16 sm:py-20 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
            <Sparkles className="h-4 w-4" />
            Purpose-built for modern cafés and restaurants
          </div>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
              Bring every shift under one calm, connected command center.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-stone-600">
              CafeOS helps teams move orders faster, track inventory in real time, and keep guests delighted without juggling disconnected tools.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-orange-500 text-white hover:bg-orange-600">
              <Link href="/scan" className="inline-flex items-center gap-2">
                Scan QR to Order
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" className="rounded-full bg-amber-600 text-white hover:bg-amber-700">
              <Link href="#contact" className="inline-flex items-center gap-2">
                For Restaurants
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

        <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-[0_20px_60px_-30px_rgba(28,25,23,0.45)] sm:p-4">
          <Image
            src="/marketing-hero.svg"
            alt="CafeOS operating system overview"
            width={720}
            height={640}
            priority
            className="h-auto w-full rounded-[1.5rem]"
          />
        </div>
      </div>
    </Section>
  );
}
