import React from "react";
import { Outlet, Link } from "react-router-dom"; // IMPORTANTE: Outlet añadido
import PortalLayout from "./PortalLayout";
import { supabase } from "../supabase/supabaseClient";
import { LayoutDashboard, CreditCard, FileText, User, Trophy } from "lucide-react"; 
import { FamilyProvider, useFamily } from "../context/FamilyContext"; 

// Componente del selector superior
function StickyChildSelector() {
  const { players, activeChildId, changeActiveChild } = useFamily();
  
  if (!players || players.length <= 1) return null;

  return (
    <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide border-b border-white/5">
      {players.map((child: any) => (
        <button
          key={child.id}
          onClick={() => changeActiveChild(child.id)}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 border whitespace-nowrap ${
            child.id === activeChildId 
              ? "bg-brand-neon/10 border-brand-neon text-white shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]" 
              : "bg-[#162032]/40 border-white/5 text-slate-500 hover:border-white/10"
          }`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
            child.id === activeChildId ? "bg-brand-neon text-[#0D1B2A]" : "bg-white/5 text-slate-500"
          }`}>
            {child.name.charAt(0)}
          </div>
          <span className="text-xs font-bold">{child.name}</span>
        </button>
      ))}
    </div>
  );
}

const links = [
  { to: "/family-dashboard", label: "Inicio", icon: LayoutDashboard, end: true },
  { to: "/family-dashboard/torneos", label: "Torneos", icon: Trophy }, 
  { to: "/family-dashboard/pagos", label: "Pagos", icon: CreditCard },
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
        
        {/* AQUÍ ESTABA EL PROBLEMA: FALTABA EL OUTLET */}
        <div className="mt-4 animate-in fade-in duration-500">
           <Outlet />
        </div>

      </PortalLayout>
    </FamilyProvider>
  );
}