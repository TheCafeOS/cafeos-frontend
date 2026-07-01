import { CtaSection } from "@/components/marketing/cta-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { FooterSection } from "@/components/marketing/footer-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { WhyCafeOSSection } from "@/components/marketing/why-cafeos-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <MarketingNavbar />
      <main>
        <HeroSection />
        <WhyCafeOSSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <FooterSection />
    </div>
  );
}
