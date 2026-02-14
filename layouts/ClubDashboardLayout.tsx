import React from "react";
import PortalLayout from "./PortalLayout";
import { supabase } from "../supabase/supabaseClient";
import { LayoutDashboard, Users, UserPlus, Briefcase, CreditCard, Trophy } from "lucide-react";

// Iconos profesionales
const links = [
  { to: "/club-dashboard", label: "Inicio", icon: LayoutDashboard, end: true },
  { to: "/club-dashboard/torneos", label: "Torneos", icon: Trophy }, // <--- AÑADIDO AQUÍ
  { to: "/club-dashboard/equipos", label: "Equipos", icon: Users },
  { to: "/club-dashboard/jugadores", label: "Jugadores", icon: UserPlus },
  { to: "/club-dashboard/staff", label: "Staff", icon: Briefcase },
  { to: "/club-dashboard/pagos", label: "Pagos", icon: CreditCard },
];

function getEmailFromLocalSession() {
  const raw = localStorage.getItem("session");
  if (!raw) return "";
  try {
    const s = JSON.parse(raw);
    return s?.email ?? "";
  } catch {
    return "";
  }
}

export default function ClubDashboardLayout() {
  return (
    <PortalLayout
      portal="club"
      links={links}
      getSessionEmail={getEmailFromLocalSession}
      onLogout={async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.href = "/login";
      }}
    />
  );
}