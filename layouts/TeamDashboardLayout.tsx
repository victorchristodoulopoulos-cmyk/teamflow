import React from "react";
import PortalLayout from "./PortalLayout";
import { supabase } from "../supabase/supabaseClient";

const links = [
  { to: "/team-dashboard", label: "Dashboard", icon: "▦", end: true },
  { to: "/team-dashboard/jugadores", label: "Jugadores", icon: "👥" },
];

function getEmailFromLocalSession() {
  // Si ya guardas email en localStorage "session" OK.
  // Si no, quedará vacío y lo verás en el header como "—".
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
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.href = "/login";
      }}
    />
  );
}
