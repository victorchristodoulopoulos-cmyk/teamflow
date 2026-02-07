import React from "react";
import Hero from "../components/Hero";
import Services from "../components/Services";
import HowItWorks from "../components/HowItWorks";
import WhyUs from "../components/WhyUs";
import Pricing from "../components/Pricing";
import Testimonials from "../components/Testimonials";
import CTA from "../components/CTA";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-accent selection:text-brand-dark">
      <main className="flex-grow">
        <Hero />
        <Services />
        <HowItWorks />
        <WhyUs />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
    </div>
  );
};

export default LandingPage;
