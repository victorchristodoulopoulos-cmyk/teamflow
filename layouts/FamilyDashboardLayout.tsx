import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import PortalLayout from "./PortalLayout";
import { supabase } from "../supabase/supabaseClient";
import { LayoutDashboard, CreditCard, FileText, User, Trophy, Map as MapIcon, Users, MessageCircle } from "lucide-react";
import { FamilyProvider, useFamily } from "../context/FamilyContext"; 

function StickyChildSelector() {
  const { players, activeChildId, changeActiveChild } = useFamily();
  const location = useLocation();
  
  // 1. Si no hay jugadores o solo hay uno, no mostramos el selector.
  if (!players || players.length <= 1) return null;

  // 🔥 CLINICAL CHANGE: Si estamos en la página de Chat, ocultamos este selector global
  // porque el chat ya tiene el suyo propio adaptado al diseño.
  if (location.pathname.includes("/family-dashboard/chat")) return null;

  // 2. Lógica de visibilidad: Ocultamos "TODOS" si estamos en el Dashboard (Inicio)
  const isDashboard = location.pathname === "/family-dashboard";

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar border-b border-white/5 sticky top-0 z-20 bg-[#0D1B2A]/50 backdrop-blur-md -mx-4 px-4 md:mx-0 md:px-0">
      
      {/* BOTÓN TODOS: Solo se muestra si NO estamos en el Dashboard */}
      {!isDashboard && (
        <>
          <button
            onClick={() => changeActiveChild(null)}
            className={`px-4 py-2 rounded-xl transition-all duration-300 border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0 ${
              activeChildId === null 
                ? "bg-white text-brand-deep border-white" // Sombreado eliminado aquí
                : "bg-[#162032]/40 border-white/5 text-slate-500 hover:border-white/10"
            }`}
          >
            <Users size={12} strokeWidth={3} />
            Todos
          </button>
          <div className="w-px h-4 bg-white/10 shrink-0" />
        </>
      )}

      {/* HIJOS INDIVIDUALES */}
      <div className="flex items-center gap-2">
        {players.map((child: any) => (
          <button
            key={child.id}
            onClick={() => changeActiveChild(child.id)}
            className={`px-4 py-2 rounded-xl transition-all duration-300 border text-[10px] font-black uppercase tracking-widest shrink-0 ${
              child.id === activeChildId 
                ? "bg-brand-neon border-brand-neon text-brand-deep" // Sombreado (glow) eliminado aquí
                : "bg-[#162032]/40 border-white/5 text-slate-400 hover:border-white/10"
            }`}
          >
            {child.name}
          </button>
        ))}
      </div>
    </div>
  );
}

const links = [
  { to: "/family-dashboard", label: "Inicio", icon: LayoutDashboard, end: true },
  { to: "/family-dashboard/torneos", label: "Torneos", icon: Trophy }, 
  { to: "/family-dashboard/stages", label: "Stages", icon: MapIcon },
  { to: "/family-dashboard/pagos", label: "Pagos", icon: CreditCard },
  { to: "/family-dashboard/chat", label: "Chat", icon: MessageCircle }, // 🔥 NUEVO BOTÓN
  { to: "/family-dashboard/documentos", label: "Docs", icon: FileText },
  { to: "/family-dashboard/perfil", label: "Perfil", icon: User },
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
    <FamilyProvider>
      <PortalLayout
        portal="family"
        links={links}
        getSessionEmail={getEmailFromLocalSession}
        onLogout={async () => {
          await supabase.auth.signOut();
        }}
      >
        <StickyChildSelector />
        
        {/* CORRECCIÓN: Quitamos animate-in que a veces mete zoom, 
            y usamos una transición de opacidad simple que no pesa en móvil */}
        <div className="md:animate-in md:fade-in md:duration-500">
           <Outlet />
        </div>
      </PortalLayout>
    </FamilyProvider>
  );
}