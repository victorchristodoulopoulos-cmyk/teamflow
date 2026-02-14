import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTeam } from "../../context/TeamContext";
import { getPlayersForAssignedTeams } from "../../supabase/teamPlayersService";
import { 
  Users, Trophy, MapPin, Calendar, ChevronDown, 
  Shield, AlertCircle, CheckCircle2, ArrowRight 
} from "lucide-react";

const TeamDashboardHome = () => {
  const navigate = useNavigate();
  // Asumo que tu contexto expone 'teams' y 'setActiveTeam' además de 'activeTeam'
  const { activeTeam, teams, setActiveTeam, loading: teamLoading } = useTeam();

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ["team-players", activeTeam?.id],
    queryFn: () =>
      activeTeam
        ? getPlayersForAssignedTeams(activeTeam.id)
        : Promise.resolve([]),
    enabled: !!activeTeam,
  });

  const stats = useMemo(() => {
    const inscritos = players.filter((p) => p.status?.toLowerCase() === "inscrito").length;
    const pendientes = players.filter((p) => p.status?.toLowerCase() !== "inscrito").length;
    const total = players.length;
    const pct = total ? Math.round((inscritos / total) * 100) : 0;
    return { inscritos, pendientes, total, pct };
  }, [players]);

  if (teamLoading) return <div className="p-10 text-brand-neon font-mono animate-pulse uppercase">Cargando perfil técnico...</div>;

  if (!activeTeam) {
    return (
      <div className="p-10 border-2 border-dashed border-white/5 rounded-[32px] text-center">
        <Shield size={48} className="mx-auto text-slate-600 mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest">No tienes equipos asignados actualmente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER CON SELECTOR DE EQUIPO INTEGRADO */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="px-3 py-1 rounded-full bg-brand-neon/10 border border-brand-neon/20 text-[10px] font-black text-brand-neon uppercase tracking-widest">
               Vista Entrenador
             </div>
             {/* Selector de Equipo Estilizado */}
             <div className="relative group">
                <select 
                  className="appearance-none bg-transparent text-slate-500 font-bold text-xs uppercase tracking-widest pr-6 outline-none cursor-pointer hover:text-white transition-colors"
                  value={activeTeam.id}
                  onChange={(e) => {
                    const selected = teams.find((t: any) => t.id === e.target.value);
                    if (selected && setActiveTeam) setActiveTeam(selected);
                  }}
                >
                  {teams.map((t: any) => (
                    <option key={t.id} value={t.id} className="bg-[#0D1B2A] text-white">
                      CAMBIAR A: {t.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-0 top-0.5 text-slate-500 pointer-events-none group-hover:text-white" />
             </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
            {activeTeam.name}
          </h1>
          
          <div className="flex flex-wrap gap-6 mt-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
             <span className="flex items-center gap-1.5 text-white">
               <Trophy size={14} className="text-brand-neon" /> 
               {activeTeam.torneo?.name ?? "Torneo no asignado"}
             </span>
             {activeTeam.torneo?.ciudad && (
               <span className="flex items-center gap-1.5">
                 <MapPin size={14} /> {activeTeam.torneo.ciudad}
               </span>
             )}
          </div>
        </div>

        {/* Mini KPI Torneo */}
        <div className="bg-[#162032] border border-white/10 p-6 rounded-2xl min-w-[200px]">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Estado Inscripción</p>
           <div className="flex items-end gap-2">
              <span className="text-4xl font-display font-black text-white leading-none">{stats.pct}%</span>
              <span className="text-xs font-bold text-brand-neon mb-1">Completado</span>
           </div>
           <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-brand-neon h-full transition-all duration-1000" style={{ width: `${stats.pct}%` }} />
           </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Jugadores */}
        <div 
          onClick={() => navigate('/team-dashboard/jugadores')}
          className="bg-[#162032]/40 border border-white/5 p-6 rounded-[24px] hover:bg-[#162032] hover:border-brand-neon/30 transition-all cursor-pointer group"
        >
           <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                 <Users size={24} />
              </div>
              <ArrowRight size={20} className="text-slate-600 group-hover:text-white" />
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plantilla Total</p>
           <p className="text-4xl font-display font-black text-white mt-1">{stats.total}</p>
        </div>

        {/* Card 2: Pendientes */}
        <div 
          onClick={() => navigate('/team-dashboard/jugadores')}
          className="bg-[#162032]/40 border border-white/5 p-6 rounded-[24px] hover:bg-[#162032] hover:border-orange-500/30 transition-all cursor-pointer group"
        >
           <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                 <AlertCircle size={24} />
              </div>
              <ArrowRight size={20} className="text-slate-600 group-hover:text-white" />
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pendientes de Pago/Docs</p>
           <p className="text-4xl font-display font-black text-white mt-1">{stats.pendientes}</p>
        </div>

        {/* Card 3: Inscritos OK */}
        <div className="bg-[#162032]/40 border border-white/5 p-6 rounded-[24px]">
           <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <CheckCircle2 size={24} />
              </div>
           </div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Listos para jugar</p>
           <p className="text-4xl font-display font-black text-white mt-1">{stats.inscritos}</p>
        </div>
      </div>

      {/* QUICK ROSTER PREVIEW */}
      <div className="bg-[#162032]/40 border border-white/5 rounded-[32px] p-8">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-display font-black text-white uppercase italic">Últimos Jugadores</h3>
            <button 
              onClick={() => navigate('/team-dashboard/jugadores')}
              className="text-xs font-black text-brand-neon uppercase tracking-widest hover:underline"
            >
              Ver plantilla completa
            </button>
         </div>

         {playersLoading ? (
            <p className="text-slate-500 text-sm animate-pulse">Cargando datos...</p>
         ) : players.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay jugadores asignados.</p>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {players.slice(0, 6).map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0D1B2A] border border-white/5">
                     <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-slate-400 text-xs">
                        {p.name.charAt(0)}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-white uppercase">{p.name} {p.surname}</p>
                        <p className={`text-[10px] font-black uppercase tracking-wider ${
                           p.status?.toLowerCase() === 'inscrito' ? 'text-emerald-500' : 'text-orange-500'
                        }`}>
                           {p.status || "Pendiente"}
                        </p>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

    </div>
  );
};

export default TeamDashboardHome;