import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Building2 } from "lucide-react"; 

export default function PortalLayout({
  portal, 
  title, 
  subtitle, 
  links, 
  getSessionEmail, 
  onLogout, 
  brandName, 
  children,
  // 🔥 NUEVAS PROPS
  clubName,
  clubLogoUrl
}: any) {
  const navigate = useNavigate();

  return (
    <div data-portal={portal} className="min-h-screen bg-[#0D1B2A] text-[#E0E1DD] font-sans selection:bg-brand-neon selection:text-[#0D1B2A] pb-28 lg:pb-0">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-[260px] fixed h-full z-30 border-r border-white/5 bg-[#0D1B2A]/90 backdrop-blur-xl">
        <div className="p-8">
          {/* Logo Principal TeamFlow */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded bg-brand-neon flex items-center justify-center text-[#0D1B2A] font-black font-display text-lg">CF</div>
            <span className="font-display font-bold text-lg tracking-tight text-white">CLUBFLOW</span>
          </div>

          {/* Navegación PC */}
          <nav className="space-y-2">
            {links.map((l: any) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-brand-neon text-[#0D1B2A] font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] translate-x-1" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"}
                `}
              >
                <l.icon size={18} />
                <span>{l.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Info Footer con Identidad de Club */}
        <div className="mt-auto p-6 border-t border-white/5 bg-black/20">
          
          {/* 🔥 BLOQUE DE IDENTIDAD DEL CLUB */}
          {portal === "club" && clubName && (
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">Tu Entidad</p>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                {clubLogoUrl ? (
                  <img src={clubLogoUrl} alt="Club Logo" className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-500">
                    <Building2 size={20} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-black text-white uppercase truncate tracking-tight">{clubName}</p>
                  
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Conectado como</p>
          <p className="text-sm text-white truncate font-medium mb-4 italic">{getSessionEmail?.()}</p>
          
          <button onClick={onLogout} className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors font-bold uppercase tracking-widest group">
            <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
              <LogOut size={14} />
            </div>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="lg:pl-[260px]">
        {/* HEADER MÓVIL */}
        <div className="lg:hidden flex items-center justify-between p-6 sticky top-0 z-20 bg-[#0D1B2A]/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-neon flex items-center justify-center text-[#0D1B2A] font-black text-xs">TF</div>
            <span className="font-display font-bold text-white tracking-tight italic uppercase">
               {portal === "club" ? clubName : "CLUBFLOW"}
            </span>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-white">
            <LogOut size={18} />
          </button>
        </div>

        {/* ÁREA DE CONTENIDO */}
        <div className="p-6 lg:p-12 max-w-[1600px] mx-auto">
          <div className="mb-8 lg:mb-12">
            <p className="text-brand-neon text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] mb-2">{title}</p>
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-white tracking-tight uppercase italic">{subtitle}</h1>
          </div>
          
          {children ?? <Outlet />}
        </div>
      </main>

      {/* --- MOBILE NAVBAR (DOCK) --- */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-[#162032]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-2 flex justify-between items-center">
          {links.map((l: any) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `
                flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-200
                ${isActive ? "text-brand-neon bg-white/5" : "text-slate-500 hover:text-slate-300"}
              `}
            >
              {({ isActive }) => (
                <>
                  <l.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-1">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

    </div>
  );
}