import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import Logo from "../components/branding/Logo";
import { 
  LayoutDashboard, Shield, LogOut, Users, Trophy, 
  Building2, MapPin, Wallet, Settings 
} from "lucide-react";

export default function TournamentDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [torneoInfo, setTorneoInfo] = useState<{name: string} | null>(null);

  useEffect(() => {
    const fetchTorneo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('torneo_id').eq('id', user.id).single();
        if (profile?.torneo_id) {
          const { data: torneo } = await supabase.from('torneos').select('name').eq('id', profile.torneo_id).single();
          if (torneo) setTorneoInfo(torneo);
        }
      }
    };
    fetchTorneo();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navItems = [
    { to: "/tournament-dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/tournament-dashboard/clubs", icon: Building2, label: "Clubes & Equipos" },
    { to: "/tournament-dashboard/categorias", icon: Trophy, label: "Categorías" },
    { to: "/tournament-dashboard/alojamientos", icon: MapPin, label: "Alojamientos" },
    { to: "/tournament-dashboard/pagos", icon: Wallet, label: "Precios y Pagos" },
  ];

  return (
    <div className="flex h-screen bg-brand-deep text-white font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0D1B2A] border-r border-white/5 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-24 flex items-center px-8 border-b border-white/5">
            <Logo />
          </div>
          <div className="p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Gestión del Torneo</p>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.end 
                  ? location.pathname === item.to 
                  : location.pathname.startsWith(item.to);
                  
                return (
                  <NavLink key={item.to} to={item.to} end={item.end}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                      isActive 
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]" 
                        : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-amber-500" : "text-slate-500"} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-brand-deep shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Shield size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Organizador</p>
              <p className="text-sm font-bold text-white truncate">{torneoInfo?.name || "Cargando..."}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors w-full px-2 text-sm font-bold uppercase tracking-wider">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto bg-app bg-noise relative">
        <div className="p-6 md:p-10 xl:p-12 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}