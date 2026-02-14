import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ChevronRight, CreditCard, FileText, MapPin, Trophy, User } from "lucide-react";
import { useFamily } from "../../context/FamilyContext";
import { supabase } from "../../supabase/supabaseClient";

// 👇 FUNCIÓN AUXILIAR PARA EL STORAGE (Necesaria para los escudos)
const getClubLogoUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('club-logos').getPublicUrl(path);
  return data.publicUrl;
};

export default function FamilyDashboardHome() {
  const navigate = useNavigate();
  // 1. Obtenemos todo del contexto (fíjate que ahora sacamos changeActiveChild)
  const { players, activeChild, activeChildId, changeActiveChild, loading: appLoading, globalData } = useFamily();

  // 🛡️ EFECTO FRANCOTIRADOR: Si entra y está en "TODOS", forzamos al primer hijo
  useEffect(() => {
    if (!appLoading && players.length > 0 && !activeChildId) {
      changeActiveChild(players[0].id);
    }
  }, [appLoading, players, activeChildId, changeActiveChild]);

  // Pantalla de carga (o espera mientras auto-selecciona al primer hijo)
  if (appLoading || (!activeChildId && players.length > 0)) {
    return <div className="p-10 text-brand-neon animate-pulse font-black uppercase tracking-widest">Cargando expediente...</div>;
  }

  // 2. Cálculo del próximo torneo (SOLO para el niño activo)
  let nextTournament: any = null;
  if (activeChildId) {
    const childCache = globalData[activeChildId];
    if (childCache && childCache.enrollments.length > 0) {
      const sorted = childCache.enrollments
        .filter((e) => e.torneos?.fecha && new Date(e.torneos.fecha) >= new Date(new Date().setHours(0,0,0,0)))
        .sort((a, b) => new Date(a.torneos!.fecha).getTime() - new Date(b.torneos!.fecha).getTime());
      
      nextTournament = sorted[0] || null;
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* GRID SUPERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TARJETA PRINCIPAL (SOLO HIJO ESPECÍFICO) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-[32px] border border-white/5 bg-[#162032]/60 p-8 md:p-10 flex flex-col justify-between min-h-[280px] group transition-all">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-brand-neon rounded-full blur-[120px] opacity-[0.05] pointer-events-none"></div>
          
          <div className="relative z-10 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-brand-neon uppercase tracking-[0.2em] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse" />
              Expediente Activo
            </div>
            
            <h2 className="font-display font-black text-white leading-[0.9] uppercase tracking-tighter italic break-words w-full">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl block truncate w-full">
                {activeChild?.name}
              </span>
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl text-slate-600 block break-words mt-1">
                {activeChild?.surname}
              </span>
            </h2>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/5 flex justify-between items-center mt-6">
            <button 
              onClick={() => navigate('/family-dashboard/perfil')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group/link"
            >
              Gestionar Ficha <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
              <User size={24} />
            </div>
          </div>
        </div>

        {/* TARJETA PRÓXIMO TORNEO */}
        <div 
          onClick={() => navigate("/family-dashboard/torneos")}
          className="lg:col-span-1 cursor-pointer rounded-[32px] border border-white/5 bg-[#162032]/60 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-brand-neon/30 transition-all min-h-[280px]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {nextTournament ? (
            <>
              <div className="mb-4 w-20 h-20 rounded-2xl bg-[#0D1B2A] border border-white/5 shadow-xl flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform">
                 {nextTournament.clubs?.logo_path ? (
                    <img src={getClubLogoUrl(nextTournament.clubs.logo_path)} alt="Club" className="w-full h-full object-cover" />
                 ) : (
                    <Trophy size={32} className="text-brand-neon" />
                 )}
              </div>

              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Próximo Torneo</h3>
              <p className="text-2xl font-display font-black text-white uppercase italic tracking-tight leading-none mb-3">
                {nextTournament.torneos?.name}
              </p>
              
              <div className="flex flex-col items-center gap-1 w-full">
                 <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 text-[10px] font-black uppercase tracking-widest truncate max-w-full">
                   {nextTournament.clubs?.name || "Club Confirmado"}
                 </span>
                 <span className="text-slate-400 text-[11px] mt-2 italic flex items-center justify-center gap-1">
                   <MapPin size={10} /> {nextTournament.torneos?.ciudad || "Sede TBC"} 
                 </span>
                 <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                   {nextTournament.torneos?.fecha ? new Date(nextTournament.torneos.fecha).toLocaleDateString() : "FECHA TBC"}
                 </span>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 p-4 rounded-2xl bg-[#0D1B2A] border border-white/5 shadow-xl text-slate-600">
                <Shield size={32} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Agenda Despejada</h3>
              <p className="text-xl font-bold text-white uppercase italic tracking-tight">Sin torneos próximos</p>
            </>
          )}
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div onClick={() => navigate("/family-dashboard/pagos")} className="cursor-pointer rounded-[24px] border border-white/5 bg-[#162032]/40 p-6 flex items-center gap-5 hover:bg-[#162032]/80 transition-all group">
          <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:bg-brand-neon group-hover:text-brand-deep transition-all">
            <CreditCard size={24} />
          </div>
          <div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight">Pagos</h4>
            <p className="text-xs text-slate-400 mt-1">Facturas pendientes y recibos</p>
          </div>
        </div>
        <div onClick={() => navigate("/family-dashboard/documentos")} className="cursor-pointer rounded-[24px] border border-white/5 bg-[#162032]/40 p-6 flex items-center gap-5 hover:bg-[#162032]/80 transition-all group">
          <div className="h-14 w-14 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 text-brand-neon flex items-center justify-center group-hover:bg-white group-hover:text-brand-deep transition-all">
            <FileText size={24} />
          </div>
          <div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight">Documentos</h4>
            <p className="text-xs text-slate-400 mt-1">Documentación médica y oficial</p>
          </div>
        </div>
      </div>
    </div>
  );
}