import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { InspectionReportForm } from "@/components/report-section";
import { AboutUs } from "@/components/about-us";
import { WhyUs } from "@/components/why-us";
import { Pricing } from "@/components/pricing";
import { ContactSection } from "@/components/contact-form";
import { Disclaimer } from "@/components/disclaimer";
import { FooterSection } from "@/components/footer";
import { Flags } from "@/components/flags";

export default function Home() {
  return (
    <main className="max-w-[1920px] mx-auto relative overflow-hidden">
      <Navbar />
      <HeroSection />
      <InspectionReportForm />
      <Flags />
      <AboutUs />
      <WhyUs />
      <Pricing />
      <ContactSection />
      <Disclaimer />
      <FooterSection /> 
    </main>
  );
}
