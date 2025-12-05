import React from "react";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Public components
import LandingPage from "./pages/LandingPage";
import ServicesPage from "./pages/public/Services";
import HowItWorksPage from "./pages/public/HowItWorksPage";
import BenefitsPage from "./pages/public/Benefits";
import PricingPage from "./pages/public/PricingPage";
import ContactPage from "./pages/public/Contact";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Auth
import Login from "./pages/Login";

// Admin Layout + Pages
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Tournaments from "./pages/dashboard/Tournaments";
import Teams from "./pages/dashboard/Teams";
import Documentation from "./pages/dashboard/Documentation";
import Hotels from "./pages/dashboard/Hotels";
import Transport from "./pages/dashboard/Transport";
import Payments from "./pages/dashboard/Payments";

// TEAM Layout + Pages
import TeamDashboardLayout from "./layouts/TeamDashboardLayout";
import TeamDashboardHome from "./pages/team/TeamDashboardHome";

// Public Layout wrapper
const PublicLayout = () => (
  <div className="min-h-screen flex flex-col font-sans bg-carbon">
    <Navbar />
    <main className="flex-grow pt-20">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/como-funciona" element={<HowItWorksPage />} />
          <Route path="/beneficios" element={<BenefitsPage />} />
          <Route path="/precios" element={<PricingPage />} />
          <Route path="/contacto" element={<ContactPage />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin Portal */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="tournaments" element={<Tournaments />} />
          <Route path="teams" element={<Teams />} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="transport" element={<Transport />} />
          <Route path="payments" element={<Payments />} />
        </Route>

        {/* TEAM PORTAL */}
        <Route path="/team-dashboard" element={<TeamDashboardLayout />}>
          <Route index element={<TeamDashboardHome />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
