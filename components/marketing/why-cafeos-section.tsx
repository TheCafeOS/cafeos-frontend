import { Clock3, ShieldCheck, Workflow } from "lucide-react";
import { Section } from "@/components/shared/section";

const reasons = [
  {
    title: "Built for busy shifts",
    description:
      "Keep orders moving from the customer to the kitchen without switching between multiple systems or losing track of what's happening.",
    icon: Clock3,
  },
  {
    title: "Everything stays connected",
    description:
      "Orders, tables, menus, stock, and your team work together in one platform, helping everyone stay on the same page.",
    icon: Workflow,
  },
  {
    title: "Ready to grow with you",
    description:
      "Whether you're running one café today or expanding tomorrow, CafeOS is designed to support your business as it grows.",
    icon: ShieldCheck,
  },
];

export function WhyCafeOSSection() {
  return (
    <Section
      id="why-cafeos"
      eyebrow="Why CafeOS"
      title="Built for the way modern cafés operate"
      description="CafeOS replaces disconnected tools with one platform that keeps your restaurant running smoothly from the first order to the last table."
      className="bg-white"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {reasons.map((reason) => {
          const Icon = reason.icon;

          return (
            <article
              key={reason.title}
              className="rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="text-xl font-semibold text-stone-900">
                {reason.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-stone-600">
                {reason.description}
              </p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}