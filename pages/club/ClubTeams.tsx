import { useEffect, useState } from "react";
import { getClubTeams, getMyClubContext, EquipoRow, getTeamRosterWithFinances } from "../../supabase/clubService";
import { Users, Hash, Shield, ChevronRight, AlertCircle, CheckCircle, Search, Trophy } from "lucide-react";

export default function ClubTeams() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<EquipoRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ESTADOS DEL DETALLE (Roster)
  const [selectedTeam, setSelectedTeam] = useState<EquipoRow | null>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const ctx = await getMyClubContext();
      const data = await getClubTeams(ctx.club_id);
      setTeams(data);
      if (data.length > 0) handleSelectTeam(data[0]); 
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSelectTeam = async (team: EquipoRow) => {
    setSelectedTeam(team);
    setLoadingRoster(true);
    try {
      const rosterData = await getTeamRosterWithFinances(team.id);
      setRoster(rosterData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRoster(false);
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.torneos?.name && t.torneos.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="p-10 text-brand-neon font-mono animate-pulse uppercase font-black tracking-widest">Sincronizando Equipos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter italic text-white uppercase leading-none">
            Roster Analítico
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-3">
            Panel de supervisión global de expediciones
          </p>
        </div>
      </header>

      {/* GRID MAESTRO-DETALLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* COLUMNA IZQUIERDA: LISTA DE EQUIPOS (4 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="relative mb-6">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input 
               type="text" 
               placeholder="Buscar equipo o torneo..."
               className="w-full bg-[#162032] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-xs font-bold tracking-widest outline-none focus:border-brand-neon transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="bg-[#162032]/20 border border-white/5 rounded-[32px] p-4 flex flex-col gap-2">
            <div className="px-4 py-2 flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Expediciones Confirmadas</span>
                <span className="text-[10px] font-black text-brand-neon px-2 py-1 rounded-lg bg-brand-neon/10">{filteredTeams.length}</span>
            </div>

            {filteredTeams.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center text-slate-500">
                    <Shield size={32} className="mb-4 opacity-50" />
                    <p className="text-xs uppercase font-bold tracking-widest">Sin equipos encontrados</p>
                    <p className="text-[9px] mt-2 max-w-[200px]">Recuerda que los equipos se crean desde la ficha de cada Torneo.</p>
                </div>
            ) : (
                filteredTeams.map((t) => (
                    <button 
                        key={t.id}
                        onClick={() => handleSelectTeam(t)}
                        className={`w-full flex items-center justify-between p-4 rounded-[20px] border transition-all text-left group ${
                            selectedTeam?.id === t.id 
                            ? "bg-brand-neon/10 border-brand-neon/30 text-white" 
                            : "bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:border-white/10"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 ${
                                selectedTeam?.id === t.id ? "bg-brand-neon text-black shadow-[0_0_15px_rgba(var(--brand-neon-rgb),0.4)]" : "bg-[#0D1B2A] text-slate-500 border border-white/5"
                            }`}>
                                <Users size={16} />
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="font-bold uppercase tracking-wide truncate">{t.name}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Trophy size={10} className={selectedTeam?.id === t.id ? "text-brand-neon" : "text-slate-600"} />
                                    <span className="text-[9px] uppercase tracking-widest font-black opacity-70 truncate">
                                        {t.torneos?.name || 'Torneo TBC'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={16} className={`shrink-0 transition-transform ${selectedTeam?.id === t.id ? "text-brand-neon translate-x-1" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                    </button>
                ))
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMNA DERECHA: DETALLE DEL EQUIPO (8 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-8">
            {selectedTeam ? (
                <div className="bg-[#162032]/40 border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col">
                    
                    {/* Background Header */}
                    <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-brand-neon/5 to-transparent border-b border-brand-neon/10"></div>

                    {/* Team Header Info */}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-[24px] bg-[#0D1B2A] border border-white/10 flex items-center justify-center text-brand-neon shadow-2xl shrink-0">
                                <Shield size={36} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-brand-neon uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
                                  <Trophy size={12} /> {selectedTeam.torneos?.name}
                                </p>
                                <h2 className="text-4xl md:text-5xl font-display font-black text-white italic uppercase leading-none tracking-tight">
                                    {selectedTeam.name}
                                </h2>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-black/40 border border-white/5 px-6 py-4 rounded-2xl text-center backdrop-blur-md">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Plantilla</p>
                                <p className="text-2xl font-black text-white">{roster.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Roster Table */}
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Users size={16} className="text-brand-neon" /> Estado Financiero del Roster
                            </h3>
                        </div>

                        {loadingRoster ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-brand-neon border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Analizando Roster...</p>
                            </div>
                        ) : roster.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[32px] bg-black/20">
                                <Users size={48} className="mx-auto mb-6 text-slate-700 opacity-50" />
                                <p className="text-white font-black uppercase italic text-xl tracking-tight mb-2">Plantilla Vacía</p>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                    Añade jugadores desde la Sala de Máquinas del Torneo.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-black/30 border border-white/5 rounded-[24px] overflow-x-auto">
                                <table className="w-full text-left min-w-[500px]">
                                    <thead className="bg-black/50 text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">
                                        <tr>
                                            <th className="p-5 pl-8">Jugador</th>
                                            <th className="p-5">DNI</th>
                                            <th className="p-5">Estado</th>
                                            <th className="p-5 text-right pr-8">Deuda</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {roster.map((player) => (
                                            <tr key={player.player_id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-5 pl-8">
                                                    <p className="text-sm font-bold text-white uppercase">{player.name} {player.surname}</p>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{player.status}</p>
                                                </td>
                                                <td className="p-5 font-mono text-xs text-slate-400">
                                                    {player.dni || '---'}
                                                </td>
                                                <td className="p-5">
                                                    {player.isUpToDate ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                                                            <CheckCircle size={10} /> Al Día
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest">
                                                            <AlertCircle size={10} /> Pendiente
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-5 pr-8 text-right">
                                                    {player.totalPending > 0 ? (
                                                        <span className="text-lg font-black text-red-400 italic">-{player.totalPending}€</span>
                                                    ) : (
                                                        <span className="text-sm font-bold text-slate-600">0.00€</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full min-h-[600px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-[#162032]/20">
                    <div className="text-center">
                        <Shield size={64} className="mx-auto mb-6 text-slate-700 opacity-20" />
                        <p className="text-white font-black uppercase italic text-2xl tracking-tighter">Selecciona un Equipo</p>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Usa el panel izquierdo para supervisar la expedición</p>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}