import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Layouts Principales
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// --- AUTH & ROUTE GUARDS ---
import AdminRoute from "./layouts/AdminRoute";
import ClubRoute from "./layouts/ClubRoute";
import TeamRoute from "./layouts/TeamRoute";
import FamilyRoute from "./layouts/FamilyRoute";
import { TeamProvider } from "./context/TeamContext";

// --- LOGIN & PUBLIC ---
import LoginSelector from "./pages/LoginSelector";
import Login from "./pages/Login"; 
import DemoAccess from "./pages/dashboard/DemoAccess";
import TeamRegister from "./pages/public/TeamRegister";

// --- ZONA SUPER ADMIN (EL MODO DIOS) ---
import SuperAdminLayout from "./pages/admin/SuperAdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClubs from "./pages/admin/AdminClubs";
import AdminTeams from "./pages/admin/AdminTeams"; 
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

// --- OTROS DASHBOARDS ---
import ClubDashboardLayout from "./layouts/ClubDashboardLayout";
import ClubDashboardHome from "./pages/club/ClubDashboardHome";
import ClubTournaments from "./pages/club/ClubTournaments";
import ClubTournamentDetail from "./pages/club/ClubTournamentDetail"; 
import ClubTeams from "./pages/club/ClubTeams";
import ClubPlayers from "./pages/club/ClubPlayers";
import ClubStaff from "./pages/club/ClubStaff";
import ClubPayments from "./pages/club/ClubPayments";

import TeamDashboardLayout from "./layouts/TeamDashboardLayout";
import TeamDashboardHome from "./pages/team/TeamDashboardHome";
import TeamPlayers from "./pages/team/TeamPlayers";
import TeamLogistics from "./pages/team/TeamLogistics";

import FamilyDashboardLayout from "./layouts/FamilyDashboardLayout";
import FamilyDashboardHome from "./pages/family/FamilyDashboardHome";
import FamilyTournaments from "./pages/family/FamilyTournaments";
import FamilyPayments from "./pages/family/FamilyPayments";
import FamilyDocuments from "./pages/family/FamilyDocuments";
import FamilyProfile from "./pages/family/FamilyProfile";

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-brand-deep text-white">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo" element={<DemoAccess />} />
          <Route path="/activar-staff" element={<TeamRegister />} />
        </Route>

        {/* --- LOGIN --- */}
        <Route path="/login" element={<LoginSelector />} />
        <Route path="/login/admin" element={<Login mode="admin" />} />
        <Route path="/login/team" element={<Login mode="team" />} />
        <Route path="/login/club" element={<Login mode="club" />} />
        <Route path="/login/family" element={<Login mode="family" />} />

        {/* ==========================================
            ZONA SUPER ADMIN (MASTER)
           ========================================== */}
        <Route path="/admin" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="clubs" element={<AdminClubs />} />
          <Route path="equipos" element={<AdminTeams />} />
          <Route path="tournaments" element={<AdminTournaments />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* ==========================================
            DASHBOARDS CLIENTES
           ========================================== */}
        <Route path="/club-dashboard" element={<ClubRoute><ClubDashboardLayout /></ClubRoute>}>
          <Route index element={<ClubDashboardHome />} />
          <Route path="torneos" element={<ClubTournaments />} />
          <Route path="torneos/:torneoId" element={<ClubTournamentDetail />} /> 
          <Route path="equipos" element={<ClubTeams />} />
          <Route path="jugadores" element={<ClubPlayers />} />
          <Route path="staff" element={<ClubStaff />} />
          <Route path="pagos" element={<ClubPayments />} />
        </Route>

        <Route path="/team-dashboard" element={<TeamRoute><TeamProvider><TeamDashboardLayout /></TeamProvider></TeamRoute>}>
          <Route index element={<TeamDashboardHome />} />
          <Route path="jugadores" element={<TeamPlayers />} />
          <Route path="logistica" element={<TeamLogistics />} />
        </Route>

        <Route path="/family-dashboard" element={<FamilyRoute><FamilyDashboardLayout /></FamilyRoute>}>
          <Route index element={<FamilyDashboardHome />} />
          <Route path="torneos" element={<FamilyTournaments />} />
          <Route path="pagos" element={<FamilyPayments />} />
          <Route path="documentos" element={<FamilyDocuments />} />
          <Route path="perfil" element={<FamilyProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}