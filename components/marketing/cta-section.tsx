import Link from "next/link";
import { Mail } from "lucide-react";
import { Section } from "@/components/shared/section";

export function CtaSection() {
  return (
    <Section
      id="contact"
      className="bg-stone-950 py-16 sm:py-20"
      contentClassName="rounded-[2rem] border border-stone-800 bg-stone-900/80 p-8 shadow-2xl sm:p-10 lg:p-12"
    >
      <div className="max-w-3xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-400">
          Contact
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ready to bring CafeOS to your restaurant?
        </h2>

        <p className="text-lg leading-8 text-stone-300">
          Have questions about CafeOS or want to onboard your restaurant? Send
          us an email and our team will help you get started.
        </p>

        <Link
          href="mailto:cafeos.app@gmail.com"
          className="flex items-center gap-3 rounded-xl border border-stone-700 bg-stone-950/60 p-4 transition-colors hover:border-amber-500"
        >
          <Mail className="h-5 w-5 text-amber-400" />

          <div>
            <p className="text-sm text-stone-400">Email us</p>
            <p className="text-base font-medium text-white">
              cafeos.app@gmail.com
            </p>
          </div>
        </Link>
      </div>
    </Section>
  );
}