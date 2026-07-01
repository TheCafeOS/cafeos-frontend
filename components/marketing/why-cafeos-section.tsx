import { Clock3, ShieldCheck, TrendingUp } from "lucide-react";
import { Section } from "@/components/shared/section";

const reasons = [
  {
    title: "Faster service",
    description: "Keep orders moving from the counter to the kitchen with fewer handoffs and less friction.",
    icon: Clock3,
  },
  {
    title: "Confident operations",
    description: "Give managers a dependable view of stock, prep, and daily demand without extra spreadsheets.",
    icon: ShieldCheck,
  },
  {
    title: "Smarter growth",
    description: "Use daily insights to spot trends, reduce waste, and guide staffing with clarity.",
    icon: TrendingUp,
  },
];

export function WhyCafeOSSection() {
  return (
    <Section
      id="why-cafeos"
      eyebrow="Why CafeOS"
      title="Designed to keep café operations calm and efficient"
      description="CafeOS brings the front of house, kitchen, and management view into one place so teams can focus on the guest experience."
      className="bg-white"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {reasons.map((reason) => {
          const Icon = reason.icon;
          return (
            <article key={reason.title} className="rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900">{reason.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{reason.description}</p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
