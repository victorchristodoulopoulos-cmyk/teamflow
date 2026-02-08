import React from "react";
import PortalLayout from "./PortalLayout";
import { supabase } from "../supabase/supabaseClient";

const links = [
  { to: "/team-dashboard", label: "Dashboard", icon: "▦", end: true },
  { to: "/team-dashboard/jugadores", label: "Jugadores", icon: "👥" },
  // Future: additional links like pagos, logistica if implemented
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

export default function TeamDashboardLayout() {
  return (
    <PortalLayout
      portal="team"
      title="TEAMFLOW / Team"
      subtitle="Portal de equipo"
      links={links}
      getSessionEmail={getEmailFromLocalSession}
      onLogout={async () => {
        // Ensure we sign out from Supabase auth
        await supabase.auth.signOut();
      }}
    />
  );
}
