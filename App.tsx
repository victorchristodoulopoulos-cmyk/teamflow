import React from "react";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Public
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Login
import LoginSelector from "./pages/LoginSelector";
import Login from "./pages/Login";

// Admin
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import AdminProtectedRoute from "./layouts/AdminProtectedRoute";

// Team
import TeamDashboardLayout from "./layouts/TeamDashboardLayout";
import TeamDashboardHome from "./pages/team/TeamDashboardHome";
import TeamPlayers from "./pages/team/TeamPlayers";
import TeamProtectedRoute from "./layouts/TeamProtectedRoute";

// Family (de momento placeholder simple)
const FamilyLoginPlaceholder = () => (
  <div className="min-h-screen flex items-center justify-center bg-carbon text-white">
    <div className="bg-brand-surface border border-white/10 rounded-2xl p-8 max-w-lg">
      <div className="text-2xl font-bold">Family portal</div>
      <p className="text-slate-400 mt-2">
        Aquí irá el login de familias. (Ahora mismo solo es demo.)
      </p>
    </div>
  </div>
);

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
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Login selector + logins */}
        <Route path="/login" element={<LoginSelector />} />
        <Route path="/login/admin" element={<Login />} />
        <Route path="/login/team" element={<Login />} />
        <Route path="/login/family" element={<FamilyLoginPlaceholder />} />

        {/* Admin */}
        <Route
          path="/dashboard"
          element={
            <AdminProtectedRoute>
              <DashboardLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
        </Route>

        {/* Team */}
        <Route
          path="/team-dashboard"
          element={
            <TeamProtectedRoute>
              <TeamDashboardLayout />
            </TeamProtectedRoute>
          }
        >
          <Route index element={<TeamDashboardHome />} />
          <Route path="jugadores" element={<TeamPlayers />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
