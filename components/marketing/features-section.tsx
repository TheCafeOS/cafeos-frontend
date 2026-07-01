import { Layers3, PackageCheck, Send } from "lucide-react";
import { Section } from "@/components/shared/section";

const features = [
  {
    title: "Unified order flow",
    description: "Coordinate dine-in, pickup, and delivery requests from a single, real-time workspace.",
    icon: Send,
  },
  {
    title: "Inventory awareness",
    description: "Track ingredients, recipes, and stock movement so teams can act before shortages impact service.",
    icon: PackageCheck,
  },
  {
    title: "Clear operational views",
    description: "Surface each shift’s priorities with simple tools that support day-to-day management.",
    icon: Layers3,
  },
];

export function FeaturesSection() {
  return (
    <Section
      id="features"
      eyebrow="Features"
      title="Everything needed to run a sharper service"
      description="From ticket flow to stock visibility, CafeOS keeps the important details in view so teams stay aligned."
      className="bg-stone-100/70"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article key={feature.title} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{feature.description}</p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
