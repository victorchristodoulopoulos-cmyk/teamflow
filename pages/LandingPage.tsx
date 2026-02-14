import React from "react";
import Hero from "../components/Hero";
import Services from "../components/Services";
import HowItWorks from "../components/HowItWorks";
import TechShowcase from "../components/TechShowcase"; // <-- AÑADIDO
import WhyUs from "../components/WhyUs";
import Pricing from "../components/Pricing";
import Testimonials from "../components/Testimonials";
import CTA from "../components/CTA";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-accent selection:text-brand-dark">
      <Hero />

      <TechShowcase />

      <section id="services">
        <Services />
      </section>

      <section id="how">
        <HowItWorks />
      </section>

      <WhyUs />

      <section id="pricing">
        <Pricing />
      </section>

      <Testimonials />
      <CTA />
    </div>
  );
};

export default LandingPage;
