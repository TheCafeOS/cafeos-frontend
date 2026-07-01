import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/section";

export function CtaSection() {
  return (
    <Section id="contact" className="bg-stone-950 py-16 sm:py-20" contentClassName="items-start rounded-[2rem] border border-stone-800 bg-stone-900/80 p-8 shadow-2xl sm:p-10 lg:p-12">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-400">Ready to simplify service?</p>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          See how CafeOS helps your team stay calm during every rush.
        </h2>
        <p className="text-lg leading-8 text-stone-300">
          Bring your front of house, kitchen, and management teams onto one platform built for modern café operations.
        </p>
      </div>
      <Button asChild size="lg" className="rounded-full bg-amber-600 text-white hover:bg-amber-700">
        <Link href="mailto:hello@cafeos.app" className="inline-flex items-center gap-2">
          Contact the team
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </Section>
  );
}
