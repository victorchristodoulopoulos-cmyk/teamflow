import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { fetchClub, getClubLogoPublicUrl } from "../../supabase/clubLogoService";
import { getClubDashboardStats, getMyClubContext } from "../../supabase/clubService";
import { getClubActiveTournaments, TournamentConfig } from "../../supabase/clubTournamentService";
import { Shield, Users, Trophy, MapPin, Calendar, List, ChevronRight, Wallet, TrendingUp } from "lucide-react";

export default function ClubDashboardHome() {
  const navigate = useNavigate();
  const [club, setClub] = useState<any>(null);
  const [stats, setStats] = useState({ players: 0, teams: 0, tournaments: 0 });
  const [nextTournament, setNextTournament] = useState<TournamentConfig | null>(null);
  const [upcomingTournaments, setUpcomingTournaments] = useState<TournamentConfig[]>([]);
  const [finance, setFinance] = useState({ expected: 0, collected: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  const logoUrl = useMemo(() => {
    if (!club?.logo_path) return "";
    if (club.logo_path.startsWith('http')) return club.logo_path;
    return getClubLogoPublicUrl(club.logo_path);
  }, [club?.logo_path]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { club_id } = await getMyClubContext();
        if (!club_id) { 
          setLoading(false); 
          return; 
        }

        // Cargamos datos paralelos (Club, Stats, Torneos)
        const [clubData, dashboardStats, tournaments] = await Promise.all([
          fetchClub(club_id),
          getClubDashboardStats(club_id),
          getClubActiveTournaments(club_id)
        ]);

        setClub(clubData);
        setStats(dashboardStats);

        // Lógica de Calendario
        if (tournaments && tournaments.length > 0) {
          const sorted = [...tournaments].sort((a, b) => {
            if (!a.torneos?.fecha) return 1;
            if (!b.torneos?.fecha) return -1;
            return new Date(a.torneos.fecha).getTime() - new Date(b.torneos.fecha).getTime();
          });
          
          setNextTournament(sorted[0]); // El más inminente en grande
          setUpcomingTournaments(sorted.slice(1, 4)); // Los 3 siguientes en pequeño
        }

        // 🛡️ NUEVO: Consulta rápida financiera para el Mini-Dashboard
        const { data: pagos } = await supabase
          .from('pagos')
          .select('importe, estado')
          .eq('club_id', club_id);

        let exp = 0, col = 0;
        pagos?.forEach(p => {
          exp += p.importe;
          if (p.estado === 'pagado') col += p.importe;
        });

        setFinance({ expected: exp, collected: col, pending: exp - col });

      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <div className="p-10 text-brand-neon font-mono animate-pulse uppercase font-black tracking-widest">Cargando Alojamiento...</div>;

  const financeProgress = finance.expected > 0 ? Math.round((finance.collected / finance.expected) * 100) : 0;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. HEADER: ESCUDO Y NOMBRE DEL CLUB */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-white/5">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] bg-[#162032] border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)] shrink-0 relative z-10">
          {logoUrl ? (
            <img src={logoUrl} alt="Escudo" className="w-full h-full object-cover" />
          ) : (
            <Shield size={48} className="text-white/10" />
          )}
        </div>
        
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-7xl font-display font-black text-white italic uppercase tracking-tighter leading-[0.9]">
            {club?.name || "TU CLUB"}
          </h1>
          <p className="text-brand-neon font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs mt-3 ml-1">
            Panel de Control Oficial
          </p>
        </div>
      </div>

      {/* 2. ZONA PRINCIPAL: TORNEOS Y KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA (Ocupa 2) - CALENDARIO DE EVENTOS */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex items-center justify-between">
             <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-neon animate-pulse"></span>
                Próximo Evento
             </h3>
          </div>

          {/* TARJETA EVENTO PRINCIPAL */}
          <div className="relative overflow-hidden rounded-[32px] border border-brand-neon/20 bg-gradient-to-br from-[#0D1B2A] to-[#162032] p-6 md:p-10 group shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-neon rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>

            <div className="relative z-10">
              {nextTournament ? (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center text-brand-neon shrink-0">
                      <Trophy className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black uppercase text-brand-neon tracking-[0.2em] mb-1">Confirmado</p>
                      <h2 className="text-3xl md:text-5xl font-display font-black text-white italic uppercase leading-none tracking-tight mb-2 md:mb-3">
                        {nextTournament.torneos.name}
                      </h2>
                      <div className="flex flex-wrap gap-3 md:gap-4 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-brand-neon"/> {nextTournament.torneos.ciudad}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-brand-neon"/> {new Date(nextTournament.torneos.fecha).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/club-dashboard/torneos/${nextTournament.torneo_id}`)}
                    className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-brand-neon text-brand-deep font-black text-[10px] md:text-xs uppercase tracking-[0.2em] rounded-xl md:rounded-2xl hover:bg-white transition-all shadow-[0_0_20px_rgba(var(--brand-neon-rgb),0.3)] shrink-0"
                  >
                    Gestionar
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 font-black uppercase tracking-widest text-xs md:text-sm mb-6">No hay torneos próximos</p>
                  <button onClick={() => navigate('/club-dashboard/torneos')} className="px-6 py-3 bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                    + Añadir Torneo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* LISTA COMPACTA DE SIGUIENTES TORNEOS */}
          {upcomingTournaments.length > 0 && (
            <div className="space-y-3 animate-in fade-in duration-700 delay-100">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-2">En el horizonte</h4>
               <div className="grid gap-3">
                 {upcomingTournaments.map(t => (
                   <div 
                     key={t.id} 
                     onClick={() => navigate(`/club-dashboard/torneos/${t.torneo_id}`)} 
                     className="p-4 rounded-[20px] bg-[#162032]/40 border border-white/5 flex items-center justify-between hover:bg-[#162032]/80 hover:border-white/10 cursor-pointer group transition-all"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-white/10 transition-all shrink-0">
                           <Calendar size={18} />
                         </div>
                         <div className="min-w-0">
                           <h5 className="text-sm md:text-base font-black text-white uppercase italic tracking-tight truncate">{t.torneos.name}</h5>
                           <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate block">
                             {t.torneos.ciudad} • {new Date(t.torneos.fecha).toLocaleDateString()}
                           </span>
                         </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-600 group-hover:text-brand-neon group-hover:translate-x-1 transition-all shrink-0" />
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA - KPIs y FINANZAS */}
        <div className="space-y-4 lg:pt-8">
           
           {/* 🛡️ NUEVO: Módulo Financiero Rápido */}
           <div 
             onClick={() => navigate('/club-dashboard/pagos')} 
             className="p-6 rounded-[24px] bg-brand-neon/5 border border-brand-neon/20 cursor-pointer group hover:bg-brand-neon/10 transition-all relative overflow-hidden"
           >
              <div className="absolute -right-4 -top-4 text-brand-neon/10 group-hover:text-brand-neon/20 transition-colors pointer-events-none transform rotate-12">
                <Wallet size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <span className="text-[10px] font-black text-brand-neon uppercase tracking-[0.2em]">Caja Central</span>
                      <h3 className="text-3xl font-display font-black text-white italic mt-1 leading-none tracking-tighter">
                        {finance.collected.toLocaleString('es-ES', {minimumFractionDigits: 2})}€ 
                        <span className="text-sm text-slate-500 not-italic font-sans block mt-1 tracking-widest">/ {finance.expected.toLocaleString('es-ES', {minimumFractionDigits: 0})}€ PREVISTOS</span>
                      </h3>
                   </div>
                </div>
                
                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mb-3">
                   <div className="bg-brand-neon h-full transition-all duration-1000" style={{width: `${financeProgress}%`}}></div>
                </div>
                
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                  <span className="text-slate-400 flex items-center gap-1"><TrendingUp size={10} className="text-brand-neon"/> {financeProgress}% Recaudado</span>
                  <span className="text-orange-400">{finance.pending > 0 ? `${finance.pending.toLocaleString('es-ES', {minimumFractionDigits: 0})}€ Deuda` : 'Al día'}</span>
                </div>
              </div>
           </div>

           {/* Jugadores */}
           <div onClick={() => navigate('/club-dashboard/jugadores')} className="p-5 md:p-6 rounded-[24px] bg-[#162032]/40 border border-white/5 flex items-center justify-between hover:border-brand-neon/30 cursor-pointer transition-all group">
              <div>
                 <span className="text-2xl md:text-3xl font-display font-black text-white block leading-none mb-1">{stats.players}</span>
                 <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-brand-neon transition-colors">Jugadores</span>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-neon/10 flex items-center justify-center text-brand-neon">
                 <Users size={20} className="md:w-6 md:h-6" />
              </div>
           </div>

           {/* Equipos */}
           <div onClick={() => navigate('/club-dashboard/equipos')} className="p-5 md:p-6 rounded-[24px] bg-[#162032]/40 border border-white/5 flex items-center justify-between hover:border-purple-400/30 cursor-pointer transition-all group">
              <div>
                 <span className="text-2xl md:text-3xl font-display font-black text-white block leading-none mb-1">{stats.teams}</span>
                 <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">Equipos</span>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                 <Shield size={20} className="md:w-6 md:h-6" />
              </div>
           </div>

           {/* Calendario Total */}
           <button 
             onClick={() => navigate('/club-dashboard/torneos')}
             className="w-full p-5 md:p-6 rounded-[24px] bg-[#0D1B2A] border border-white/10 flex items-center justify-between group hover:bg-[#162032] transition-all"
           >
              <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">Ver Calendario Completo</span>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-neon group-hover:text-brand-deep transition-all">
                <List size={14} />
              </div>
           </button>
        </div>

      </div>
    </div>
  );
}