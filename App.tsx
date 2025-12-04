import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ServicesPage from './pages/public/Services';
import HowItWorksPage from './pages/public/HowItWorksPage';
import BenefitsPage from './pages/public/Benefits';
import PricingPage from './pages/public/PricingPage';
import ContactPage from './pages/public/Contact';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import TeamLayout from './layouts/TeamLayout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Admin Pages
import Overview from './pages/dashboard/Overview';
import Tournaments from './pages/dashboard/Tournaments';
import Teams from './pages/dashboard/Teams';
import Documentation from './pages/dashboard/Documentation';
import Hotels from './pages/dashboard/Hotels';
import Transport from './pages/dashboard/Transport';
import Payments from './pages/dashboard/Payments';

// Team Pages
import TeamOverview from './pages/team/TeamOverview';
import TeamRoster from './pages/team/TeamRoster';
import TeamLogistics from './pages/team/TeamLogistics';

// Public Layout Wrapper
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

        {/* Admin Portal Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="tournaments" element={<Tournaments />} />
          <Route path="teams" element={<Teams />} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="transport" element={<Transport />} />
          <Route path="payments" element={<Payments />} />
        </Route>

        {/* Team Portal Routes */}
        <Route path="/team" element={<TeamLayout />}>
           <Route path="dashboard" element={<TeamOverview />} />
           <Route path="roster" element={<TeamRoster />} />
           <Route path="logistics" element={<TeamLogistics />} />
           <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;