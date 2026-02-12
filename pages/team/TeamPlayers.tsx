import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTeam } from "../../context/TeamContext";
import { getPlayersForAssignedTeams } from "../../supabase/teamPlayersService";
import { Search, Filter, User, CheckCircle2, AlertCircle, Shield } from "lucide-react";

export default function TeamPlayers() {
  const { activeTeam, loading: teamLoading } = useTeam();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "inscrito" | "pendiente">("all");

  const { data: players = [], isLoading } = useQuery({
    queryKey: ["team-players", activeTeam?.id],
    queryFn: () =>
      activeTeam
        ? getPlayersForAssignedTeams(activeTeam.id)
        : Promise.resolve([]),
    enabled: !!activeTeam,
  });

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return players.filter((p) => {
      const status = (p.status ?? "").toLowerCase();
      // Filtro de estado flexible (acepta mayúsculas/minúsculas)
      if (filter === "inscrito" && status !== "inscrito") return false;
      if (filter === "pendiente" && status === "inscrito") return false;
      
      // Filtro de texto
      if (!qq) return true;
      const name = `${p.name} ${p.surname ?? ""}`.toLowerCase();
      return name.includes(qq);
    });
  }, [players, q, filter]);

  if (teamLoading) return <div className="p-10 text-brand-neon font-mono animate-pulse uppercase">Cargando equipo...</div>;
  if (!activeTeam) return <div className="p-10 text-white">No hay equipo seleccionado.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-2 text-purple-400">
              <Shield size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{activeTeam.nombre}</span>
           </div>
           <h1 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">Plantilla</h1>
        </div>
        
        {/* KPI Rápido */}
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-[#162032] rounded-xl border border-white/10 text-center">
              <span className="block text-2xl font-display font-black text-white">{players.length}</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total</span>
           </div>
        </div>
      </div>

      {/* TOOLBAR (Buscador y Filtros) */}
      <div className="bg-[#162032]/40 border border-white/5 p-4 rounded-[24px] flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-brand-neon outline-none placeholder:text-slate-600 transition-colors"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
         </div>
         
         <div className="flex bg-[#0D1B2A] p-1 rounded-xl border border-white/10">
            <button 
               onClick={() => setFilter("all")}
               className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-brand-deep shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
               Todos
            </button>
            <button 
               onClick={() => setFilter("inscrito")}
               className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'inscrito' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
               Inscritos
            </button>
            <button 
               onClick={() => setFilter("pendiente")}
               className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'pendiente' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
               Pendientes
            </button>
         </div>
      </div>

      {/* LISTA DE JUGADORES */}
      <div className="bg-[#162032]/40 border border-white/5 rounded-[32px] overflow-hidden">
         {isLoading ? (
            <div className="p-10 text-center text-slate-500 uppercase font-bold text-xs">Cargando lista...</div>
         ) : filtered.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center opacity-50">
               <Users size={48} className="text-slate-600 mb-4" />
               <p className="text-slate-400 font-bold uppercase">No se encontraron jugadores</p>
            </div>
         ) : (
            <div className="divide-y divide-white/5">
               {/* Cabecera Tabla Desktop */}
               <div className="hidden md:grid grid-cols-12 px-8 py-4 bg-[#0D1B2A]/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="col-span-5">Jugador</div>
                  <div className="col-span-4">ID de Equipo</div>
                  <div className="col-span-3 text-right">Estado</div>
               </div>

               {filtered.map(p => {
                  const isOk = (p.status ?? "").toLowerCase() === 'inscrito';
                  
                  return (
                     <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 px-8 py-5 items-center hover:bg-white/[0.02] transition-colors group gap-3 md:gap-0">
                        {/* Info Jugador */}
                        <div className="col-span-5 flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#162032] to-[#0D1B2A] border border-white/10 flex items-center justify-center font-black text-slate-400 text-xs group-hover:text-white transition-colors">
                              {p.name.charAt(0)}
                           </div>
                           <span className="text-sm font-bold text-white uppercase">{p.name} {p.surname}</span>
                        </div>

                        {/* ID Equipo */}
                        <div className="col-span-4 text-xs font-mono text-slate-500 font-bold">
                           {p.equipo_id.slice(0, 8)}...
                        </div>

                        {/* Estado */}
                        <div className="col-span-3 flex justify-end">
                           {isOk ? (
                              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                                 <CheckCircle2 size={14} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Confirmado</span>
                              </div>
                           ) : (
                              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500">
                                 <AlertCircle size={14} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Pendiente</span>
                              </div>
                           )}
                        </div>
                     </div>
                  );
               })}
            </div>
         )}
      </div>

    </div>
  );
}