import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Public
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Login
import LoginSelector from "./pages/LoginSelector";
import Login from "./pages/Login";
import LoginFamily from "./pages/LoginFamily";

// Admin
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/dashboard/Overview";

// Team
import TeamDashboardLayout from "./layouts/TeamDashboardLayout";
import TeamDashboardHome from "./pages/team/TeamDashboardHome";
import TeamPlayers from "./pages/team/TeamPlayers";

// Family
import FamilyDashboardLayout from "./layouts/FamilyDashboardLayout";
import FamilyDashboardHome from "./pages/family/FamilyDashboardHome";
import FamilyPayments from "./pages/family/FamilyPayments";
import FamilyDocuments from "./pages/family/FamilyDocuments";
import FamilyProfile from "./pages/family/FamilyProfile";

// Guards
import AdminRoute from "./layouts/AdminRoute";
import TeamRoute from "./layouts/TeamRoute";
import FamilyRoute from "./layouts/FamilyRoute";

const PublicLayout = () => (
  <div className="min-h-screen flex flex-col bg-carbon">
    <Navbar />
    <main className="flex-grow pt-20">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* LOGIN */}
        <Route path="/login" element={<LoginSelector />} />
        <Route path="/login/admin" element={<Login mode="admin" />} />
        <Route path="/login/team" element={<Login mode="team" />} />
        <Route path="/login/family" element={<LoginFamily />} />

        {/* ADMIN */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <DashboardLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Overview />} />
        </Route>

        {/* TEAM */}
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
        </Route>

        {/* FAMILY */}
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

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
