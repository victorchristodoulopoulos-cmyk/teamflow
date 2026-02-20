import React, { useState, useEffect } from "react";
import PortalLayout from "./PortalLayout";
import { supabase } from "../supabase/supabaseClient";
import { LayoutDashboard, Briefcase, CreditCard, Trophy, Map, MessageCircle } from "lucide-react"; // 🔥 Añadido MessageCircle
import { getMyClubContext } from "../supabase/clubService";

// 🔥 Menú Limpio: Equipos y Jugadores se moverán dentro del hub de Torneos
const links = [
  { to: "/club-dashboard", label: "Inicio", icon: LayoutDashboard, end: true },
  { to: "/club-dashboard/torneos", label: "Torneos & Equipos", icon: Trophy },
  { to: "/club-dashboard/stages", label: "Stages & Viajes", icon: Map },
  { to: "/club-dashboard/chat", label: "Chat Familias", icon: MessageCircle }, // 🔥 NUEVA PESTAÑA
  { to: "/club-dashboard/staff", label: "Staff", icon: Briefcase },
  { to: "/club-dashboard/pagos", label: "Caja Central", icon: CreditCard },
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
  const [clubName, setClubName] = useState("");
  const [clubLogo, setClubLogo] = useState<string | null>(null);

  useEffect(() => {
    async function loadClubData() {
      try {
        const { club_id } = await getMyClubContext();
        
        const { data } = await supabase
          .from("clubs")
          .select("name, logo_path")
          .eq("id", club_id)
          .single();

        if (data) {
          setClubName(data.name);
          if (data.logo_path) {
            const { data: publicUrlData } = supabase.storage
              .from('club-logos')
              .getPublicUrl(data.logo_path);
            setClubLogo(publicUrlData.publicUrl);
          }
        }
      } catch (error) {
        console.error("Error cargando logo del club:", error);
      }
    }

    loadClubData();
  }, []);

  return (
    <PortalLayout
      portal="club"
      links={links}
      getSessionEmail={getEmailFromLocalSession}
      clubName={clubName} 
      clubLogoUrl={clubLogo}
      onLogout={async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.href = "/login";
      }}
    />
  );
}