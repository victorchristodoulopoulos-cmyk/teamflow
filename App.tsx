import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// Login pages
import LoginSelector from "./pages/LoginSelector";
import Login from "./pages/Login";
import LoginFamily from "./pages/LoginFamily";
// Admin pages and layout
import AdminRoute from "./layouts/AdminRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Tournaments from "./pages/dashboard/Tournaments";
import TeamsPage from "./pages/dashboard/Teams";           // Assuming Teams page exists
import Documentation from "./pages/dashboard/Documentation";
import Hotels from "./pages/dashboard/Hotels";
import TransportPage from "./pages/dashboard/Transport";
import PaymentsPage from "./pages/dashboard/Payments";
// Team pages and layout
import TeamRoute from "./layouts/TeamRoute";
import TeamDashboardLayout from "./layouts/TeamDashboardLayout";
import TeamDashboardHome from "./pages/team/TeamDashboardHome";
import TeamPlayers from "./pages/team/TeamPlayers";
import TeamLogistics from "./pages/team/TeamLogistics";     // If implemented
import TeamOverview from "./pages/team/TeamOverview";       // Not in nav, but could be used
// Family pages and layout
import FamilyRoute from "./layouts/FamilyRoute";
import FamilyDashboardLayout from "./layouts/FamilyDashboardLayout";
import FamilyDashboardHome from "./pages/family/FamilyDashboardHome";
import FamilyPayments from "./pages/family/FamilyPayments";
import FamilyDocuments from "./pages/family/FamilyDocuments";
import FamilyProfile from "./pages/family/FamilyProfile";
// Demo page
import DemoAccess from "./pages/dashboard/DemoAccess";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoAccess />} />
        <Route path="/login" element={<LoginSelector />} />
        <Route path="/login/admin" element={<Login mode="admin" />} />
        <Route path="/login/team" element={<Login mode="team" />} />
        <Route path="/login/family" element={<LoginFamily />} />

        {/* Admin portal protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <AdminRoute>
              <DashboardLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="tournaments" element={<Tournaments />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="transport" element={<TransportPage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>

        {/* Team portal protected routes */}
        <Route 
          path="/team-dashboard" 
          element={
            <TeamRoute>
              <TeamDashboardLayout />
            </TeamRoute>
          }
        >
          <Route index element={<TeamDashboardHome />} />
          <Route path="jugadores" element={<TeamPlayers />} />
          <Route path="logistica" element={<TeamLogistics />} />
          {/* We could include TeamOverview or other pages if needed */}
        </Route>

        {/* Family portal protected routes */}
        <Route 
          path="/family-dashboard" 
          element={
            <FamilyRoute>
              <FamilyDashboardLayout />
            </FamilyRoute>
          }
        >
          <Route index element={<FamilyDashboardHome />} />
          <Route path="pagos" element={<FamilyPayments />} />
          <Route path="documentos" element={<FamilyDocuments />} />
          <Route path="perfil" element={<FamilyProfile />} />
        </Route>

        {/* Catch-all: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
