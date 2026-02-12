import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchClub, getClubLogoPublicUrl } from "../../supabase/clubLogoService";
import { getClubDashboardStats } from "../../supabase/clubService";
import { getClubActiveTournaments, TournamentConfig } from "../../supabase/clubTournamentService";
import { Shield, Users, Trophy, MapPin, Calendar, List } from "lucide-react";

export default function ClubDashboardHome() {
  const navigate = useNavigate();
  const [club, setClub] = useState<any>(null);
  const [stats, setStats] = useState({ players: 0, teams: 0, tournaments: 0 });
  const [nextTournament, setNextTournament] = useState<TournamentConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const clubId = useMemo(() => {
    const raw = localStorage.getItem("session");
    if (!raw) return null;
    try { 
      const s = JSON.parse(raw);
      return s?.clubId ?? s?.club_id ?? null; 
    } catch { return null; }
  }, []);

  const logoUrl = useMemo(() => {
    if (!club?.logo_path) return "";
    if (club.logo_path.startsWith('http')) return club.logo_path;
    return getClubLogoPublicUrl(club.logo_path);
  }, [club?.logo_path]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!clubId) { setLoading(false); return; }
      try {
        const [clubData, dashboardStats, tournaments] = await Promise.all([
          fetchClub(clubId),
          getClubDashboardStats(clubId),
          getClubActiveTournaments(clubId)
        ]);

        setClub(clubData);
        setStats(dashboardStats);

        if (tournaments && tournaments.length > 0) {
          const sorted = [...tournaments].sort((a, b) => 
            new Date(a.torneos.fecha).getTime() - new Date(b.torneos.fecha).getTime()
          );
          setNextTournament(sorted[0]);
        }
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    loadDashboard();
  }, [clubId]);

  if (loading) return <div className="p-10 text-brand-neon font-mono animate-pulse uppercase font-black">Cargando Club...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. HEADER: ESCUDO Y NOMBRE DEL CLUB */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-white/5">
        {/* Logo / Escudo */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-[#162032] border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] shrink-0 relative z-10">
          {logoUrl ? (
            <img src={logoUrl} alt="Escudo" className="w-full h-full object-cover" />
          ) : (
            <Shield size={48} className="text-white/10" />
          )}
        </div>
        
        {/* Nombre */}
        <div className="text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-display font-black text-white italic uppercase tracking-tighter leading-[0.9]">
            {club?.name || "TU CLUB"}
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs mt-3 ml-1">
            Panel de Control Oficial
          </p>
        </div>
      </div>

      {/* 2. ZONA PRINCIPAL: PRÓXIMO TORNEO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: TORNEO DESTACADO (Ocupa 2 espacios) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-neon animate-pulse"></span>
                Próximo Evento
             </h3>
             <button 
                onClick={() => navigate('/club-dashboard/torneos')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#162032] border border-white/10 text-[10px] font-black text-brand-neon uppercase tracking-widest hover:bg-brand-neon hover:text-brand-deep transition-all"
             >
                <List size={14} />
                Ver Torneos Activos
             </button>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-brand-neon/30 bg-gradient-to-br from-[#0D1B2A] to-[#162032] p-8 md:p-10 group shadow-2xl">
            {/* Fondo decorativo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-neon rounded-full blur-[150px] opacity-[0.08] pointer-events-none"></div>

            <div className="relative z-10">
              {nextTournament ? (
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center text-brand-neon shrink-0">
                      <Trophy size={40} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-brand-neon tracking-[0.2em] mb-1">Confirmado</p>
                      <h2 className="text-4xl md:text-5xl font-display font-black text-white italic uppercase leading-none tracking-tight mb-3">
                        {nextTournament.torneos.nombre}
                      </h2>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1"><MapPin size={14} className="text-brand-neon"/> {nextTournament.torneos.ciudad}</span>
                        <span className="flex items-center gap-1"><Calendar size={14} className="text-brand-neon"/> {new Date(nextTournament.torneos.fecha).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/club-dashboard/torneos/${nextTournament.torneo_id}`)}
                    className="w-full md:w-auto px-8 py-4 bg-brand-neon text-brand-deep font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)]"
                  >
                    Gestionar
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 font-black uppercase tracking-widest text-sm mb-6">No hay torneos próximos</p>
                  <button onClick={() => navigate('/club-dashboard/torneos')} className="px-6 py-3 bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                    + Añadir Torneo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: RESUMEN RÁPIDO (KPIs) - Operaciones eliminado */}
        <div className="space-y-4 pt-10 lg:pt-0">
           {/* Jugadores */}
           <div onClick={() => navigate('/club-dashboard/jugadores')} className="p-6 rounded-[24px] bg-[#162032]/40 border border-white/5 flex items-center justify-between hover:border-brand-neon/30 cursor-pointer transition-all group">
              <div>
                 <span className="text-3xl font-display font-black text-white block">{stats.players}</span>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-brand-neon transition-colors">Jugadores</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-neon/10 flex items-center justify-center text-brand-neon">
                 <Users size={20} />
              </div>
           </div>

           {/* Equipos */}
           <div onClick={() => navigate('/club-dashboard/equipos')} className="p-6 rounded-[24px] bg-[#162032]/40 border border-white/5 flex items-center justify-between hover:border-purple-400/30 cursor-pointer transition-all group">
              <div>
                 <span className="text-3xl font-display font-black text-white block">{stats.teams}</span>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">Equipos</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                 <Shield size={20} />
              </div>
           </div>

           {/* Acceso directo a todos los torneos (Botón extra grande) */}
           <button 
             onClick={() => navigate('/club-dashboard/torneos')}
             className="w-full p-6 rounded-[24px] bg-[#0D1B2A] border border-white/10 flex items-center justify-between group hover:bg-[#162032] transition-all"
           >
              <span className="text-xs font-black text-white uppercase tracking-widest">Ver Calendario Completo</span>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-neon group-hover:text-brand-deep transition-all">
                <List size={16} />
              </div>
           </button>
        </div>

      </div>
    </div>
  );
}