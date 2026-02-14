import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTeam } from "../../context/TeamContext";
import { getPlayersForAssignedTeams } from "../../supabase/teamPlayersService";
import { supabase } from "../../supabase/supabaseClient";
import { Search, Filter, User, CheckCircle2, AlertCircle, Shield, Users, Edit2, Loader2 } from "lucide-react";

export default function TeamPlayers() {
  const { activeTeam, loading: teamLoading } = useTeam();
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();

  // Estados para la edición de posición inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const { data: players = [], isLoading } = useQuery({
    queryKey: ["team-players", activeTeam?.id],
    queryFn: () =>
      activeTeam
        ? getPlayersForAssignedTeams(activeTeam.id)
        : Promise.resolve([]),
    enabled: !!activeTeam,
  });

  // Mutación para actualizar la posición en Supabase
  const updatePositionMutation = useMutation({
    mutationFn: async ({ playerId, newPosition }: { playerId: string, newPosition: string }) => {
      const { error } = await supabase
        .from('jugadores')
        .update({ position: newPosition })
        .eq('id', playerId);
      if (error) throw error;
      return { playerId, newPosition };
    },
    onSuccess: (data) => {
      // Actualizamos la caché local para que la UI se refresque al instante
      queryClient.setQueryData(["team-players", activeTeam?.id], (oldData: any[]) => {
        return oldData.map(p => p.id === data.playerId ? { ...p, position: data.newPosition } : p);
      });
      setEditingId(null);
    },
    onError: (err) => {
      console.error("Error actualizando posición", err);
      alert("No se pudo actualizar la posición");
      setEditingId(null);
    }
  });

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return players;
    return players.filter((p) => {
      const name = `${p.name} ${p.surname ?? ""}`.toLowerCase();
      return name.includes(qq);
    });
  }, [players, q]);

  const handleEditClick = (player: any) => {
    setEditingId(player.id);
    setEditValue(player.position || "");
  };

  const handleSavePosition = (playerId: string) => {
    if (editingId === playerId) {
      updatePositionMutation.mutate({ playerId, newPosition: editValue });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, playerId: string) => {
    if (e.key === 'Enter') handleSavePosition(playerId);
    if (e.key === 'Escape') setEditingId(null);
  };

  if (teamLoading) return <div className="p-10 text-brand-neon font-mono animate-pulse uppercase">Cargando equipo...</div>;
  if (!activeTeam) return <div className="p-10 text-white">No hay equipo seleccionado.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-2 text-purple-400">
              <Shield size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{activeTeam.name}</span>
           </div>
           <h1 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">Plantilla</h1>
        </div>
        
        {/* KPI Rápido */}
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-[#162032] rounded-xl border border-white/10 text-center">
              <span className="block text-2xl font-display font-black text-white">{players.length}</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Jugadores</span>
           </div>
        </div>
      </div>

      {/* TOOLBAR (Solo Buscador, Filtros de estado eliminados por ser irrelevantes para el míster) */}
      <div className="bg-[#162032]/40 border border-white/5 p-4 rounded-[24px] flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar jugador..." 
              className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-brand-neon outline-none placeholder:text-slate-600 transition-colors"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
         </div>
      </div>

      {/* LISTA DE JUGADORES REDISEÑADA */}
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
               <div className="hidden md:grid grid-cols-12 px-8 py-5 bg-[#0D1B2A]/50 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  <div className="col-span-5">Jugador</div>
                  <div className="col-span-4">Equipo Origen</div>
                  <div className="col-span-3 text-right pr-4">Demarcación</div>
               </div>

               {filtered.map(p => (
                  <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 px-8 py-5 items-center hover:bg-white/[0.02] transition-colors group gap-4 md:gap-0">
                     
                     {/* Info Jugador */}
                     <div className="col-span-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#162032] to-[#0D1B2A] border border-white/10 flex items-center justify-center font-black text-slate-400 text-sm group-hover:text-brand-neon transition-colors shadow-inner shrink-0">
                           {p.name.charAt(0)}
                        </div>
                        <div>
                           <span className="text-sm font-black text-white uppercase tracking-tight block">{p.name} {p.surname}</span>
                           {/* En móvil mostramos el equipo origen debajo del nombre para ahorrar espacio */}
                           <span className="md:hidden text-[10px] text-slate-500 font-bold uppercase mt-0.5 block flex items-center gap-1">
                              <Shield size={10} /> {p.actual_team || "Sin Club Origen"}
                           </span>
                        </div>
                     </div>

                     {/* Equipo Origen (Solo en Desktop) */}
                     <div className="col-span-4 hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Shield size={14} className="text-slate-600" />
                        {p.actual_team || "---"}
                     </div>

                     {/* Posición Editable */}
                     <div className="col-span-12 md:col-span-3 flex md:justify-end md:pr-4">
                        {editingId === p.id ? (
                           <div className="relative flex items-center w-full md:w-32 animate-in zoom-in-95">
                             <input 
                               autoFocus
                               className="w-full bg-[#0D1B2A] border border-brand-neon rounded-lg px-3 py-1.5 text-[10px] text-white font-black uppercase tracking-widest outline-none pr-8"
                               value={editValue}
                               onChange={(e) => setEditValue(e.target.value)}
                               onBlur={() => handleSavePosition(p.id)}
                               onKeyDown={(e) => handleKeyDown(e, p.id)}
                               placeholder="EJ: MCD"
                             />
                             {updatePositionMutation.isPending && (
                                <Loader2 size={12} className="absolute right-2 text-brand-neon animate-spin" />
                             )}
                           </div>
                        ) : (
                           <button 
                             onClick={() => handleEditClick(p)}
                             className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all w-full md:w-auto justify-between md:justify-center group/pos border-white/10 bg-[#0D1B2A]/50 hover:bg-white/5 hover:border-white/20"
                           >
                              <span className={`text-[10px] font-black uppercase tracking-widest ${p.position ? 'text-white' : 'text-slate-500 italic'}`}>
                                {p.position || "Asignar"}
                              </span>
                              <Edit2 size={12} className="text-slate-600 group-hover/pos:text-brand-neon transition-colors" />
                           </button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

    </div>
  );
}