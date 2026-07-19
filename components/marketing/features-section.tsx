import { ClipboardList, PackageCheck, QrCode } from "lucide-react";
import { Section } from "@/components/shared/section";

const features = [
  {
    title: "QR Ordering",
    description:
      "Customers scan a QR code, browse your digital menu, and place orders without downloading an app.",
    icon: QrCode,
  },
  {
    title: "Order Management",
    description:
      "Track every order in real time, from placement to completion, so your kitchen and staff stay in sync.",
    icon: ClipboardList,
  },
  {
    title: "Tables & Stock",
    description:
      "Manage tables, menus, and stock from one dashboard to keep service running smoothly throughout the day.",
    icon: PackageCheck,
  },
];

export function FeaturesSection() {
  return (
    <Section
      id="features"
      eyebrow="Features"
      title="Everything your restaurant needs to stay in sync"
      description="CafeOS brings together the tools your team uses every day, helping you serve customers faster without switching between multiple systems."
      className="bg-stone-100/70"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-white">
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="text-xl font-semibold text-stone-900">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-stone-600">
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}