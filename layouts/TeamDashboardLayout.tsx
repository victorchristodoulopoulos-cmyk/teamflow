import React from "react";
import PortalLayout from "./PortalLayout";

const links = [
  { to: "/team-dashboard", label: "Dashboard", icon: "▦", end: true },
  { to: "/team-dashboard/jugadores", label: "Jugadores", icon: "👥" },
  // añade más cuando existan:
  // { to: "/team-dashboard/pagos", label: "Pagos", icon: "💳" },
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
    />
  );
}
