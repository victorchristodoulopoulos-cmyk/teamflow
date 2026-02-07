import React from "react";
import PortalLayout from "./PortalLayout";
import { supabase } from "../supabase/supabaseClient";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "▦", end: true },
  { to: "/dashboard/tournaments", label: "Torneos", icon: "🏆" },
  { to: "/dashboard/teams", label: "Equipos", icon: "👥" },
  { to: "/dashboard/documentation", label: "Docs", icon: "📁" },
  { to: "/dashboard/hotels", label: "Hoteles", icon: "🏨" },
  { to: "/dashboard/transport", label: "Transporte", icon: "🚌" },
  { to: "/dashboard/payments", label: "Pagos", icon: "💳" },
];

function getEmailFromSupabaseOrLocal() {
  // fallback rápido: local session
  const raw = localStorage.getItem("session");
  if (raw) {
    try {
      return JSON.parse(raw)?.email ?? "";
    } catch {}
  }
  return "";
}

export default function DashboardLayout() {
  return (
    <PortalLayout
      portal="admin"
      title="TEAMFLOW / Admin"
      subtitle="Portal administración"
      links={links}
      getSessionEmail={getEmailFromSupabaseOrLocal}
      onLogout={async () => {
        await supabase.auth.signOut();
      }}
    />
  );
}
