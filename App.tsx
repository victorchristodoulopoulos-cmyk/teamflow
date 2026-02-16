import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./supabase/supabaseClient";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from '@capacitor/push-notifications';

// Layouts Principales
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// --- AUTH & ROUTE GUARDS ---
import AdminRoute from "./layouts/AdminRoute";
import ClubRoute from "./layouts/ClubRoute";
import TeamRoute from "./layouts/TeamRoute";
import FamilyRoute from "./layouts/FamilyRoute";
import TournamentRoute from "./layouts/TournamentRoute"; 
import { TeamProvider } from "./context/TeamContext";

// --- LOGIN & PUBLIC ---
import LoginSelector from "./pages/LoginSelector";
import Login from "./pages/Login"; 
import DemoAccess from "./pages/dashboard/DemoAccess";
import TeamRegister from "./pages/public/TeamRegister";
import PublicRegistration from "./pages/public/PublicRegistration"; 
import ClubRegister from "./pages/public/ClubRegister"; 
import PublicTournamentRegistration from "./pages/public/PublicTournamentRegistration";

// --- ZONA SUPER ADMIN ---
import SuperAdminLayout from "./pages/admin/SuperAdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClubs from "./pages/admin/AdminClubs";
import AdminClubDetail from "./pages/admin/AdminClubDetail"; 
import AdminTeams from "./pages/admin/AdminTeams";
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminLogisticsHub from "./pages/admin/AdminLogisticsHub";

// --- TOURNAMENT DASHBOARD 🏆 ---
import TournamentDashboardLayout from "./layouts/TournamentDashboardLayout";
import TournamentDashboardHome from "./pages/tournament/TournamentDashboardHome";
import TournamentClubs from "./pages/tournament/TournamentClubs";
import TournamentClubDetail from "./pages/tournament/TournamentClubDetail"; // 🔥 NUEVO: La Biblia del Club
import TournamentCategories from "./pages/tournament/TournamentCategories"; // 🔥 NUEVO: Matriz de Categorías
import TournamentAccommodations from "./pages/tournament/TournamentAccommodations"; // 🔥 NUEVO: Alojamientos
import TournamentSettings from "./pages/tournament/TournamentSettings"; // 🔥 NUEVO: Pagos y Settings

// --- CLUB DASHBOARD ---
import ClubDashboardLayout from "./layouts/ClubDashboardLayout";
import ClubDashboardHome from "./pages/club/ClubDashboardHome";
import ClubTournaments from "./pages/club/ClubTournaments";
import ClubTournamentDetail from "./pages/club/ClubTournamentDetail"; 
import ClubTeams from "./pages/club/ClubTeams";
import ClubPlayers from "./pages/club/ClubPlayers";
import ClubStaff from "./pages/club/ClubStaff";
import ClubPayments from "./pages/club/ClubPayments";

// --- TEAM DASHBOARD ---
import TeamDashboardLayout from "./layouts/TeamDashboardLayout";
import TeamDashboardHome from "./pages/team/TeamDashboardHome";
import TeamPlayers from "./pages/team/TeamPlayers";
import TeamLogistics from "./pages/team/TeamLogistics";

// --- FAMILY DASHBOARD ---
import FamilyDashboardLayout from "./layouts/FamilyDashboardLayout";
import FamilyDashboardHome from "./pages/family/FamilyDashboardHome";
import FamilyTournaments from "./pages/family/FamilyTournaments";
import FamilyPayments from "./pages/family/FamilyPayments";
import FamilyDocuments from "./pages/family/FamilyDocuments";
import FamilyProfile from "./pages/family/FamilyProfile";

// --- ANTIGUO DASHBOARD ADMIN ---
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Tournaments from "./pages/dashboard/Tournaments";
import TeamsPage from "./pages/dashboard/Teams";
import Documentation from "./pages/dashboard/Documentation";
import Hotels from "./pages/dashboard/Hotels";
import TransportPage from "./pages/dashboard/Transport";
import PaymentsPage from "./pages/dashboard/Payments";

function AppInitializer({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const handleInitialRouting = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isApp = Capacitor.isNativePlatform();
      const isLoggingIn = location.pathname.includes('/login');

      if (isApp) {
        console.log("Iniciando registro de notificaciones...");
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }
        if (permStatus.receive === 'granted') {
          await PushNotifications.register();
        }
        PushNotifications.addListener('registration', (token) => {
          console.log('--- TOKEN DE NOTIFICACION ---', token.value);
        });
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error al registrar notificaciones:', error);
        });
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          alert(`🔔 TeamFlow: ${notification.title}\n${notification.body}`);
        });
      }

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          let targetPath = "/";
          
          if (profile.role === "super_admin") {
            targetPath = "/admin/dashboard";
          } 
          else if (profile.role === "admin") {
            if (location.pathname.startsWith("/tournament-dashboard") || location.pathname.includes("tournament")) {
              targetPath = "/tournament-dashboard";
            } else {
              targetPath = "/dashboard";
            }
          } 
          else if (profile.role === "club" || profile.role === "org_admin") {
            targetPath = "/club-dashboard";
          } 
          else if (profile.role === "team") {
            targetPath = "/team-dashboard";
          } 
          else if (profile.role === "tournament") {
            targetPath = "/tournament-dashboard";
          } 
          else if (profile.role === "family") {
            targetPath = "/family-dashboard";
          }
          
          if (location.pathname === "/" || isLoggingIn) {
            navigate(targetPath, { replace: true });
          }
        }
      } else {
        if (isApp && !isLoggingIn) {
          navigate("/login", { replace: true });
        }
      }
      setInitializing(false);
    };

    handleInitialRouting();
  }, [navigate, location.pathname]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-brand-deep flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-neon border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/70 text-sm animate-pulse">Cargando TeamFlow...</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

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
      <AppInitializer>
        <Routes>
          {/* RUTAS CON NAVBAR DE TEAMFLOW */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo" element={<DemoAccess />} />
            <Route path="/activar-staff" element={<TeamRegister />} />
            <Route path="/registro" element={<PublicRegistration />} /> 
            <Route path="/activar-club" element={<ClubRegister />} />
          </Route>

          {/* 🔥 RUTA MARCA BLANCA (SIN NAVBAR NI FOOTER) */}
          <Route path="/inscripcion/:torneoId" element={<PublicTournamentRegistration />} />

          <Route path="/login" element={<LoginSelector />} />
          <Route path="/login/admin" element={<Login mode="admin" />} />
          <Route path="/login/team" element={<Login mode="team" />} />
          <Route path="/login/club" element={<Login mode="club" />} />
          <Route path="/login/family" element={<Login mode="family" />} />
          <Route path="/login/tournament" element={<Login mode="tournament" />} />

          <Route path="/admin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="clubs" element={<AdminClubs />} />
            <Route path="clubs/:id" element={<AdminClubDetail />} /> 
            <Route path="equipos" element={<AdminTeams />} />
            <Route path="tournaments" element={<AdminTournaments />} />
            <Route path="logistica" element={<AdminLogisticsHub />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* 🔥 RUTAS DEL TORNEO ACTUALIZADAS */}
          <Route path="/tournament-dashboard" element={<TournamentRoute><TournamentDashboardLayout /></TournamentRoute>}>
            <Route index element={<TournamentDashboardHome />} />
            
            <Route path="clubs" element={<TournamentClubs />} />
            <Route path="clubs/:inscripcionId" element={<TournamentClubDetail />} />
            
            <Route path="categorias" element={<TournamentCategories />} />
            <Route path="alojamientos" element={<TournamentAccommodations />} />
            <Route path="pagos" element={<TournamentSettings />} />
          </Route>

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

          {/* RUTAS ANTIGUAS ADMIN */}
          <Route path="/dashboard" element={<AdminRoute><DashboardLayout /></AdminRoute>}>
            <Route index element={<Overview />} />
            <Route path="tournaments" element={<Tournaments />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="documentation" element={<Documentation />} />
            <Route path="hotels" element={<Hotels />} />
            <Route path="transport" element={<TransportPage />} />
            <Route path="payments" element={<PaymentsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppInitializer>
    </BrowserRouter>
  );
}