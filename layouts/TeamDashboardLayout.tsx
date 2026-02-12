import React, { useEffect, useState } from "react";
import PortalLayout from "./PortalLayout";
import { supabase } from "../supabase/supabaseClient";
import { LayoutDashboard, Users, MapPin, Bus } from "lucide-react";

// Iconos y rutas para el Staff Técnico
const links = [
  { to: "/team-dashboard", label: "Panel Técnico", icon: LayoutDashboard, end: true },
  { to: "/team-dashboard/jugadores", label: "Plantilla", icon: Users },
  { to: "/team-dashboard/logistica", label: "Viaje y Hotel", icon: Bus }, // Placeholder para futuro
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
  const [profileName, setProfileName] = useState("Coach");

  // Cargamos el nombre real del entrenador para el saludo
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
        if (data?.full_name) setProfileName(data.full_name);
      }
    };
    loadProfile();
  }, []);

  return (
    <PortalLayout
      portal="team"
      title="AREA TÉCNICA"
      subtitle={profileName} // Muestra "Pep Guardiola" debajo del título
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