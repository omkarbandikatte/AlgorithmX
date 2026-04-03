import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import CoreIntelligence from "@/components/landing/CoreIntelligence";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CoreIntelligence />
        <InteractiveDemo />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
