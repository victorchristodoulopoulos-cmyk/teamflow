import React from "react";
import PortalLayout from "./PortalLayout";
import { supabase } from "../supabase/supabaseClient";

const links = [
  { to: "/family-dashboard", label: "Panel", icon: "▦", end: true },
  { to: "/family-dashboard/pagos", label: "Pagos", icon: "💳" },
  { to: "/family-dashboard/documentos", label: "Docs", icon: "📄" },
  { to: "/family-dashboard/perfil", label: "Perfil", icon: "👤" },
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

export default function FamilyDashboardLayout() {
  return (
    <PortalLayout
      portal="family"
      title="TEAMFLOW / Family"
      subtitle="Portal familiar"
      links={links}
      getSessionEmail={getEmailFromLocalSession}
      onLogout={async () => {
        await supabase.auth.signOut();
      }}
    />
  );
}
