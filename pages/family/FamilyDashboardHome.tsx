import { useNavigate } from "react-router-dom";
import { Shield, ChevronRight, CreditCard, FileText, Calendar, MapPin, Trophy } from "lucide-react";
import { useFamily } from "../../context/FamilyContext";

export default function FamilyDashboardHome() {
  const navigate = useNavigate();
  // 1. Obtenemos todo del contexto (ya cargado en memoria)
  const { activeChild, activeChildId, loading: appLoading, globalData } = useFamily();

  // Si la app aún está buscando quién es el usuario, mostramos carga mínima
  if (appLoading) return <div className="p-10 text-brand-neon animate-pulse font-black uppercase">Iniciando...</div>;

  // 2. Extraemos los datos DE LA CACHÉ (Instantáneo)
  const childCache = activeChildId ? globalData[activeChildId] : null;
  
  // Cálculo del próximo torneo basado en los datos en memoria
  let nextTournament = null;

  if (childCache && childCache.enrollments.length > 0) {
    const today = new Date();
    today.setHours(0,0,0,0);

    const sorted = childCache.enrollments
      .filter((e) => {
        if (!e.torneos) return false;
        // Si no hay fecha, asumimos que es futuro (pendiente de confirmar)
        if (!e.torneos.fecha) return true;
        // Si hay fecha, que sea hoy o futuro
        return new Date(e.torneos.fecha) >= today;
      })
      .sort((a, b) => {
         // Los que no tienen fecha van al final (o principio, según gusto)
         if (!a.torneos?.fecha) return 1;
         if (!b.torneos?.fecha) return -1;
         return new Date(a.torneos.fecha!).getTime() - new Date(b.torneos.fecha!).getTime();
      });
    
    nextTournament = sorted[0] || null;
  }

  // 3. Renderizado (sin useEffects ni estados de carga locales)
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* GRID SUPERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TARJETA JUGADOR */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-[32px] border border-white/5 bg-[#162032]/60 p-8 md:p-10 flex flex-col justify-between min-h-[280px] group transition-all">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-brand-neon rounded-full blur-[120px] opacity-[0.05] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-brand-neon uppercase tracking-[0.2em] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse" />
              Expediente Activo
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-[0.9] uppercase tracking-tighter italic">
              {activeChild?.name} <br />
              <span className="text-slate-600">{activeChild?.surname}</span>
            </h2>
          </div>

          <button onClick={() => navigate("/family-dashboard/perfil")} className="relative z-10 flex items-center gap-2 text-xs font-black text-white/50 hover:text-brand-neon transition-colors uppercase tracking-widest mt-6">
            GESTIONAR FICHA <ChevronRight size={14} />
          </button>
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
                 {nextTournament.equipos?.clubs?.logo_path ? (
                    <img 
                      src={nextTournament.equipos.clubs.logo_path} 
                      alt="Club" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                 ) : null}
                 <Trophy size={32} className={`text-brand-neon absolute ${nextTournament.equipos?.clubs?.logo_path ? 'hidden' : ''}`} />
              </div>

              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Próximo Torneo</h3>
              
              <p className="text-2xl font-display font-black text-white uppercase italic tracking-tight leading-none mb-3">
                {nextTournament.torneos?.nombre}
              </p>
              
              <div className="flex flex-col items-center gap-1 w-full">
                 <span className="px-3 py-1 rounded-full bg-brand-neon/10 text-brand-neon border border-brand-neon/20 text-[10px] font-black uppercase tracking-widest truncate max-w-full">
                    {nextTournament.equipos?.clubs?.name}
                 </span>
                 <span className="text-slate-400 text-[11px] mt-2 italic flex items-center justify-center gap-1">
                    <MapPin size={10} /> 
                    {nextTournament.torneos?.ciudad || "Sede TBC"} 
                 </span>
                 <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                    {nextTournament.torneos?.fecha 
                      ? new Date(nextTournament.torneos.fecha).toLocaleDateString() 
                      : "FECHA TBC"}
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
            <p className="text-xs text-slate-400 mt-1">Documentación</p>
          </div>
        </div>
      </div>
    </div>
  );
}