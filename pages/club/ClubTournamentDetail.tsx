import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyClubContext, getClubPlayers, createTeam } from "../../supabase/clubService";
import { 
  getClubTournamentDetails, 
  getTournamentTeams, 
  getTeamPlayersWithFinance, 
  getTeamStaff,              
  assignPlayerToTeam,
  TournamentConfig 
} from "../../supabase/clubTournamentService";
import { getClubTournamentLogistics } from "../../supabase/logisticsService";
import { supabase } from "../../supabase/supabaseClient"; 
import { 
  Trophy, MapPin, Calendar, ArrowLeft, Shield, 
  Users, Plus, X, UserPlus, CheckCircle2, AlertCircle, Briefcase, Save, DollarSign, Loader2, Search, Link as LinkIcon,
  Map, Navigation, Plane, Bus, Clock, Hotel, Info, Phone
} from "lucide-react";
import InvitePlayerModal from "./InvitePlayerModal";

const getFinanceConfig = (config: any) => {
  try {
    const parsed = typeof config === 'string' ? JSON.parse(config) : config;
    if (parsed) {
      return {
        plazos: Array.isArray(parsed.plazos_permitidos) && parsed.plazos_permitidos.length > 0 ? parsed.plazos_permitidos : [1],
        tieneMatricula: !!parsed.tiene_matricula,
        precioMatricula: parsed.precio_matricula || 0
      };
    }
  } catch (e) {
    console.error("Error leyendo JSON:", e);
  }
  return { plazos: [1], tieneMatricula: false, precioMatricula: 0 }; 
};

const getHotelImageUrl = (path: string | null) => {
  if (!path) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000";
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('hoteles').getPublicUrl(path);
  return data.publicUrl;
};

export default function ClubTournamentDetail() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [clubId, setClubId] = useState<string>(""); 
  const [tournament, setTournament] = useState<TournamentConfig | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  
  const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
  const [teamStaff, setTeamStaff] = useState<any[]>([]);

  const [newTeamName, setNewTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // FINANZAS
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [editPrice, setEditPrice] = useState<string>("");
  const [allowedInstallments, setAllowedInstallments] = useState<number[]>([1]); 
  const [hasMatricula, setHasMatricula] = useState<boolean>(false);
  const [matriculaPrice, setMatriculaPrice] = useState<string>("");
  const [savingFinances, setSavingFinances] = useState(false);

  // LOGÍSTICA
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(false);
  const [logisticsData, setLogisticsData] = useState<{hotel: any, transport: any} | null>(null);
  const [loadingLogistics, setLoadingLogistics] = useState(false);

  useEffect(() => {
    if (torneoId) loadData();
  }, [torneoId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { club_id } = await getMyClubContext();
      setClubId(club_id);
      
      const [details, torneoTeams] = await Promise.all([
        getClubTournamentDetails(club_id, torneoId!),
        getTournamentTeams(club_id, torneoId!)
      ]);

      setTournament(details);
      
      const enrichedTeams = await Promise.all(torneoTeams.map(async (t) => {
        const staff = await getTeamStaff(t.id);
        const mainCoach = staff && staff.length > 0 ? (staff[0].profiles as any)?.full_name : null;
        return { ...t, mainCoach };
      }));
      setTeams(enrichedTeams);

      if (enrichedTeams.length > 0) {
        handleSelectTeam(enrichedTeams[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLogistics = async () => {
    setIsLogisticsOpen(true);
    setLoadingLogistics(true);
    try {
      const data = await getClubTournamentLogistics(clubId, torneoId!);
      setLogisticsData(data);
    } catch (error) {
      console.error("Error cargando logística", error);
    } finally {
      setLoadingLogistics(false);
    }
  };

  const handleSelectTeam = async (team: any) => {
    setSelectedTeamId(team.id);
    setSelectedTeamName(team.name);
    const [players, staff] = await Promise.all([
        getTeamPlayersWithFinance(team.id, torneoId!),
        getTeamStaff(team.id)
    ]);
    setTeamPlayers(players || []);
    setTeamStaff(staff || []);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !clubId || !torneoId) return;
    setCreatingTeam(true);
    try {
        const newTeam = await createTeam({ club_id: clubId, name: newTeamName, torneo_id: torneoId });
        const updatedTeams = await getTournamentTeams(clubId, torneoId);
        const enrichedTeams = await Promise.all(updatedTeams.map(async (t) => {
          const staff = await getTeamStaff(t.id);
          const mainCoach = staff && staff.length > 0 ? (staff[0].profiles as any)?.full_name : null;
          return { ...t, mainCoach };
        }));
        setTeams(enrichedTeams);
        setNewTeamName("");
        const created = enrichedTeams.find(t => t.id === newTeam.id) || newTeam;
        handleSelectTeam(created); 
    } catch (error) {
        console.error("Error creando equipo:", error);
    } finally {
        setCreatingTeam(false);
    }
  };

  const openAssignModal = async () => {
    if (!selectedTeamId || !clubId) return;
    try {
      const all = await getClubPlayers(clubId);
      const currentIds = teamPlayers.map((p: any) => p.jugadores?.id);
      const available = all.filter(p => !currentIds.includes(p.player_id));
      setAvailablePlayers(available);
      setIsModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssign = async (playerId: string) => {
    if (!selectedTeamId || !clubId || !torneoId) return;
    try {
        await assignPlayerToTeam(selectedTeamId, playerId, clubId, torneoId);
        const updatedPlayers = await getTeamPlayersWithFinance(selectedTeamId, torneoId);
        setTeamPlayers(updatedPlayers);
        setAvailablePlayers(prev => prev.filter(p => p.player_id !== playerId));
    } catch (error) {
        console.error("Error asignando jugador", error);
    }
  };

  const handleSaveFinances = async () => {
    const numPrice = parseFloat(editPrice) || 0;
    const numMatricula = parseFloat(matriculaPrice) || 0;
    if (hasMatricula && numMatricula >= numPrice) {
      alert("La matrícula no puede ser igual o mayor al precio total del torneo.");
      return;
    }

    setSavingFinances(true);
    try {
      const configJson = {
        plazos_permitidos: allowedInstallments.length > 0 ? allowedInstallments : [1],
        tiene_matricula: hasMatricula,
        precio_matricula: hasMatricula ? numMatricula : 0
      };
      
      const { error } = await supabase.from('club_torneos')
        .update({ precio_total: numPrice, configuracion_pagos: configJson })
        .eq('club_id', clubId)
        .eq('torneo_id', torneoId);
        
      if (error) throw new Error(error.message);

      setTournament(prev => prev ? {...prev, precio_total: numPrice, configuracion_pagos: configJson} : null);
      setIsFinanceModalOpen(false);
    } catch (e: any) {
      console.error("Error guardando finanzas", e);
      alert(`Hubo un error al guardar: ${e.message}`);
    } finally {
      setSavingFinances(false);
    }
  };

  const toggleInstallment = (num: number) => {
    if (num === 1) return; 
    setAllowedInstallments(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num].sort((a,b)=>a-b)
    );
  };

  const openFinanceModal = () => {
    setEditPrice(tournament?.precio_total?.toString() || "0");
    const parsedConfig = getFinanceConfig(tournament?.configuracion_pagos);
    setAllowedInstallments(parsedConfig.plazos);
    setHasMatricula(parsedConfig.tieneMatricula);
    setMatriculaPrice(parsedConfig.precioMatricula.toString());
    setIsFinanceModalOpen(true);
  };

  const filteredPlayers = availablePlayers.filter(p => 
    `${p.name} ${p.surname || ''}`.toLowerCase().includes(playerSearch.toLowerCase())
  );

  if (loading) return <div className="p-10 text-brand-neon font-mono animate-pulse uppercase font-black text-center">Iniciando Gestión de Torneos...</div>;
  if (!tournament) return <div className="p-10 text-white">Expedición no encontrada</div>;

  const currentConfig = getFinanceConfig(tournament?.configuracion_pagos);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 🚀 HEADER CON ESTRUCTURA ADAPTATIVA (PC vs MÓVIL) */}
      <div className="flex flex-col xl:flex-row gap-6 md:gap-8 items-center xl:items-stretch justify-between border-b border-white/5 pb-8 text-center xl:text-left">
        
        {/* 1. IZQUIERDA: TITULO Y DATOS */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full xl:w-auto">
          <button 
            onClick={() => navigate('/club-dashboard/torneos')} 
            className="p-4 rounded-2xl bg-[#162032] border border-white/10 text-slate-400 hover:text-brand-neon hover:border-brand-neon/50 hover:scale-105 transition-all shrink-0 self-start md:self-auto hidden sm:block"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center justify-center xl:justify-start gap-2 mb-1">
               <Trophy size={16} className="text-brand-neon" />
               <span className="text-[10px] font-black text-brand-neon uppercase tracking-widest">Gestión de Expedición</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
              {tournament.torneos?.name}
            </h1>
            <div className="flex flex-wrap justify-center xl:justify-start gap-4 md:gap-6 mt-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-neon"/> {tournament.torneos?.ciudad}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-brand-neon"/> {tournament.torneos?.fecha ? new Date(tournament.torneos.fecha).toLocaleDateString() : 'TBC'}</span>
            </div>
          </div>
        </div>
        
        {/* 2. DERECHA: CONTENEDOR FLEX PARA BOTONES Y PAGOS */}
        <div className="flex flex-col xl:flex-row items-center gap-4 xl:gap-6 w-full xl:w-auto xl:flex-1 xl:justify-end">
          
          {/* BOTONES (Centro en PC, Arriba en Móvil) */}
          <div className="grid grid-cols-2 xl:flex xl:flex-row items-center gap-3 w-full max-w-sm xl:max-w-none xl:w-auto xl:mr-auto xl:ml-6">
            
            {/* BOTÓN ENLACE INVITACIÓN */}
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-4 xl:px-6 xl:py-4 bg-blue-600 border border-blue-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 whitespace-nowrap"
            >
              <LinkIcon size={16} /> <span className="hidden sm:inline">Link Registro</span><span className="sm:hidden">Invitación</span>
            </button>
            
            {/* 🚀 BOTÓN LOGÍSTICA (Más grande en PC) */}
            <button 
              onClick={handleOpenLogistics}
              className="flex items-center justify-center gap-2 px-4 py-4 xl:px-8 xl:py-5 bg-[#162032] border border-brand-neon text-white font-black text-[10px] xl:text-xs uppercase tracking-widest rounded-2xl hover:bg-brand-neon hover:text-black transition-all shadow-[0_0_20px_rgba(163,230,53,0.1)] active:scale-95 group whitespace-nowrap"
            >
              <Map size={16} className="text-brand-neon group-hover:text-black" /> Plan Viaje
            </button>
          </div>

          {/* CONFIGURACIÓN FINANCIERA DESTACADA (Derecha en PC, Abajo en Móvil) */}
          <div 
            onClick={openFinanceModal}
            className="w-full max-w-sm xl:w-[280px] xl:shrink-0 relative overflow-hidden bg-[#162032] border-2 border-brand-neon px-6 py-4 rounded-2xl text-center xl:text-right cursor-pointer hover:bg-brand-neon/10 transition-all group backdrop-blur-md flex flex-col items-center xl:items-end"
          >
             <p className="relative z-10 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex justify-center xl:justify-end items-center gap-1.5 group-hover:text-brand-neon transition-colors">
               Configuración Pagos <DollarSign size={12} />
             </p>
             <p className="relative z-10 text-3xl font-display font-black text-white leading-none">
               {tournament.precio_total || 0}<span className="text-base text-slate-500 ml-1">€</span>
             </p>
             <div className="relative z-10 flex gap-2 mt-2 w-full justify-center xl:justify-end">
               <span className="text-[8px] bg-white/5 text-slate-300 px-2 py-0.5 rounded uppercase tracking-widest font-bold">
                 {currentConfig.plazos.length} Plazos
               </span>
               {currentConfig.tieneMatricula && (
                 <span className="text-[8px] bg-brand-neon/10 text-brand-neon px-2 py-0.5 rounded uppercase tracking-widest font-black">
                   + Matrícula
                 </span>
               )}
             </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* SIDEBAR: GESTIÓN DE EQUIPOS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 md:p-6 rounded-[24px] bg-gradient-to-br from-[#162032] to-[#0D1B2A] border border-brand-neon/20 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-neon/5 rounded-full blur-[40px] pointer-events-none"></div>
             <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-4 flex items-center gap-2">
               <Shield size={18} className="text-brand-neon" /> Nuevo Equipo
             </h3>
             <form onSubmit={handleCreateTeam} className="space-y-3 relative z-10">
                <input
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-brand-neon transition-colors placeholder:text-slate-600"
                    placeholder="Ej. Alevín A, Sub-10..."
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                />
                <button 
                    type="submit" 
                    disabled={creatingTeam || !newTeamName.trim()}
                    className="w-full py-3 rounded-xl bg-brand-neon text-[#0D1B2A] font-black text-[10px] uppercase tracking-widest hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(var(--brand-neon-rgb),0.3)]"
                >
                    {creatingTeam ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} strokeWidth={3} /> Crear y Añadir</>}
                </button>
             </form>
          </div>

          <div className="flex justify-between items-center px-2 pt-2">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Equipos Confirmados</h3>
             <span className="text-[10px] font-black bg-white/5 text-slate-400 px-2 py-1 rounded-md">{teams.length}</span>
          </div>
          
          <div className="space-y-2">
            {teams.length === 0 ? (
                <div className="p-8 rounded-2xl border-2 border-dashed border-white/5 text-center bg-[#162032]/20">
                <Shield size={32} className="mx-auto text-slate-700 mb-3 opacity-50" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">Sin equipos para<br/>este torneo</p>
                </div>
            ) : (
                teams.map(team => (
                <button
                    key={team.id}
                    onClick={() => handleSelectTeam(team)}
                    className={`w-full text-left p-4 md:p-5 rounded-[20px] border transition-all flex items-center justify-between group ${
                    selectedTeamId === team.id 
                    ? "bg-brand-neon/10 text-white border-brand-neon/50 shadow-[0_0_20px_rgba(var(--brand-neon-rgb),0.1)]" 
                    : "bg-[#162032]/40 border-white/5 text-slate-400 hover:border-white/20 hover:bg-[#162032]"
                    }`}
                >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${selectedTeamId === team.id ? 'bg-brand-neon text-black shadow-lg scale-110' : 'bg-black/50 border border-white/5 text-slate-600 group-hover:scale-110'}`}>
                          <Shield size={18} />
                      </div>
                      <div className="min-w-0">
                          <span className="text-sm font-black uppercase italic tracking-tight text-white block truncate">{team.name}</span>
                          <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 truncate ${team.mainCoach ? 'text-slate-400' : 'text-orange-400/70'}`}>
                            {team.mainCoach ? `Míster: ${team.mainCoach}` : 'Entrenador por asignar'}
                          </p>
                      </div>
                    </div>
                    {selectedTeamId === team.id && <div className="w-2 h-2 rounded-full bg-brand-neon animate-pulse shadow-[0_0_10px_rgba(var(--brand-neon-rgb),1)] shrink-0"></div>}
                </button>
                ))
            )}
          </div>
        </div>

        {/* MAIN AREA JUGADORES */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTeamId ? (
             <div className="bg-[#162032]/40 border border-white/5 rounded-[24px] md:rounded-[40px] overflow-hidden min-h-[400px] md:min-h-[500px] flex flex-col shadow-2xl backdrop-blur-md">
                <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 bg-gradient-to-r from-black/40 to-transparent">
                  <div>
                     <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <Users size={16} className="text-brand-neon" />
                        <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tighter leading-none">{selectedTeamName}</h2>
                     </div>
                     <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Listado de Jugadores</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={openAssignModal}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-4 bg-brand-neon text-brand-deep font-black text-[10px] uppercase tracking-widest rounded-xl md:rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--brand-neon-rgb),0.3)] active:scale-95"
                    >
                      <UserPlus size={16} className="md:w-[18px] md:h-[18px]" strokeWidth={2.5} /> Fichar Jugador DB
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                   {teamPlayers.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-60 py-24 md:py-32 px-4">
                         <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-white/10">
                            <Users size={32} className="md:w-10 md:h-10 text-slate-500" />
                         </div>
                         <p className="text-white font-black uppercase tracking-widest text-base md:text-lg italic">Plantilla vacía</p>
                      </div>
                   ) : (
                      <div className="w-full overflow-x-hidden">
                         <table className="w-full text-left table-fixed">
                            <thead className="bg-[#0D1B2A]/80 text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 hidden sm:table-header-group">
                               <tr>
                                  <th className="px-4 md:px-8 py-4 md:py-5 w-[65%]">Jugador</th>
                                  <th className="px-4 md:px-8 py-4 md:py-5 text-right w-[35%]">Pagos</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 block sm:table-row-group">
                               {teamPlayers.map(tp => {
                                  const pending = (tournament.precio_total || 0) - (tp.totalPaid || 0);
                                  const isPaid = pending <= 0;
                                  
                                  return (
                                    <tr key={tp.id} className="group hover:bg-white/[0.02] transition-colors block sm:table-row border-b border-white/5 sm:border-0 last:border-0">
                                       <td className="px-4 md:px-8 py-4 md:py-5 block sm:table-cell">
                                          <div className="flex items-center gap-3 md:gap-4">
                                             <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#162032] to-[#0D1B2A] border border-white/10 flex items-center justify-center font-black text-brand-neon text-xs md:text-sm shadow-inner shrink-0">
                                                {tp.jugadores?.name?.charAt(0)}
                                             </div>
                                             <div className="min-w-0 flex-1">
                                                <span className="text-sm md:text-base font-black text-white uppercase tracking-tight block truncate">
                                                   {tp.jugadores?.name} {tp.jugadores?.surname}
                                                </span>
                                                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">{tp.status}</p>
                                             </div>
                                             {/* Mostrar estado financiero en móvil al lado del jugador */}
                                             <div className="sm:hidden shrink-0 pl-2 border-l border-white/5">
                                                {isPaid ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">OK</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <AlertCircle size={16} className="text-orange-500" />
                                                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">-{pending}€</span>
                                                    </div>
                                                )}
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-4 md:px-8 py-4 md:py-5 text-right hidden sm:table-cell">
                                          {isPaid ? (
                                             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Pagado</span>
                                             </div>
                                          ) : (
                                             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                                <AlertCircle size={14} className="text-orange-500" />
                                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">
                                                   Debe {pending}€
                                                </span>
                                             </div>
                                          )}
                                       </td>
                                    </tr>
                                  );
                               })}
                            </tbody>
                         </table>
                      </div>
                   )}
                </div>
             </div>
          ) : (
            <div className="h-full min-h-[400px] md:min-h-[600px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-[24px] md:rounded-[40px] bg-[#162032]/20">
               <div className="text-center px-4">
                  <Shield size={48} className="md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-slate-700 opacity-20" />
                  <p className="text-white font-black uppercase italic text-xl md:text-2xl tracking-tighter">Gestión de Torneos</p>
                  <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-2 leading-relaxed">Selecciona un equipo o crea uno nuevo a la izquierda<br className="hidden md:block"/>para empezar a organizar el viaje.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          🚀 MODAL A PANTALLA COMPLETA: LOGÍSTICA
          ========================================== */}
      {isLogisticsOpen && (
        <div className="fixed inset-0 z-[1000] bg-[#05080f] overflow-y-auto animate-in slide-in-from-bottom-4 duration-500 flex flex-col">
          {/* Header del Modal */}
          <div className="sticky top-0 z-50 bg-[#05080f]/90 backdrop-blur-xl border-b border-white/10 px-6 py-6 flex items-center justify-between shadow-2xl">
            <div>
              <p className="text-[10px] font-black text-brand-neon uppercase tracking-widest flex items-center gap-2 mb-1">
                <Map size={14} /> Plan de Viaje Oficial
              </p>
              <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter leading-none">Expedición {tournament?.torneos?.name}</h2>
            </div>
            <button onClick={() => setIsLogisticsOpen(false)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
            {loadingLogistics ? (
               <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                 <Loader2 className="animate-spin text-brand-neon mb-4" size={40} />
                 <span className="text-brand-neon font-black uppercase tracking-widest animate-pulse">Obteniendo Datos de Mando...</span>
               </div>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                 
                 {/* 🏨 CUARTEL GENERAL (HOTEL) */}
                 <div className="flex flex-col h-full">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span> Cuartel General
                    </h3>
                    
                    {logisticsData?.hotel ? (
                      <div className="bg-[#162032] border border-white/10 rounded-[40px] overflow-hidden flex flex-col shadow-2xl flex-1">
                        <div className="h-64 relative overflow-hidden bg-black">
                          <img src={getHotelImageUrl(logisticsData.hotel.image_path)} alt="Hotel" className="w-full h-full object-cover opacity-70" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#162032] via-transparent to-transparent"></div>
                          <div className="absolute top-6 left-6 flex gap-2">
                            <div className="bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                              <Hotel size={14} /> Confirmado
                            </div>
                          </div>
                        </div>

                        <div className="p-8 flex flex-col flex-1 relative z-10 -mt-8">
                          <h4 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-none mb-3">
                            {logisticsData.hotel.name}
                          </h4>
                          <p className="text-slate-400 text-base font-bold flex items-center gap-2 mb-8">
                            <MapPin size={18} className="text-blue-500 shrink-0" /> 
                            {logisticsData.hotel.address || logisticsData.hotel.ciudad || "Dirección pendiente"}
                          </p>

                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-5 rounded-3xl bg-[#0D1B2A] border border-white/5">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={12}/> Check-In</p>
                              <p className="text-lg font-black text-white">{logisticsData.hotel.check_in ? new Date(logisticsData.hotel.check_in).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBC'}</p>
                            </div>
                            <div className="p-5 rounded-3xl bg-[#0D1B2A] border border-white/5">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={12}/> Check-Out</p>
                              <p className="text-lg font-black text-white">{logisticsData.hotel.check_out ? new Date(logisticsData.hotel.check_out).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBC'}</p>
                            </div>
                          </div>

                          <div className="mt-auto space-y-3">
                            {logisticsData.hotel.contacto && (
                              <div className="flex items-center justify-center gap-3 text-sm text-slate-300 font-bold bg-white/5 py-4 rounded-2xl border border-white/5">
                                <Phone size={18} className="text-blue-500" /> Recepción: {logisticsData.hotel.contacto}
                              </div>
                            )}
                            {logisticsData.hotel.google_maps_url && (
                              <a href={logisticsData.hotel.google_maps_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-5 bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                <Map size={18} /> Abrir en Google Maps
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[40px] bg-white/5 p-10 text-center">
                         <Hotel size={64} className="text-slate-600 mb-6 opacity-50" />
                         <p className="text-2xl font-black text-white uppercase italic tracking-tighter">Alojamiento Pendiente</p>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-3 max-w-xs">TeamFlow está gestionando el hotel para la expedición.</p>
                      </div>
                    )}
                 </div>

                 {/* 🚌 PLAN DE DESPLAZAMIENTO (TRANSPORTE) */}
                 <div className="flex flex-col h-full">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-brand-neon"></span> Plan de Desplazamiento
                    </h3>

                    {logisticsData?.transport ? (
                      <div className="bg-[#162032] border border-brand-neon/20 rounded-[40px] p-8 flex flex-col shadow-2xl relative overflow-hidden flex-1">
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-neon/5 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-10 relative z-10">
                          <div>
                            <div className="w-16 h-16 rounded-[20px] bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center text-brand-neon mb-5 shadow-inner">
                              {logisticsData.transport.type?.toLowerCase().includes('avión') ? <Plane size={32} /> : <Bus size={32} />}
                            </div>
                            <h4 className="text-3xl font-display font-black text-white uppercase tracking-tighter italic leading-none">
                              {logisticsData.transport.company || "Transporte Oficial"}
                            </h4>
                            <p className="text-xs font-bold text-brand-neon uppercase tracking-widest mt-2">
                              {logisticsData.transport.type || "Bus"} • {logisticsData.transport.seats ? `${logisticsData.transport.seats} Plazas` : 'Reservado'}
                            </p>
                          </div>
                        </div>

                        {/* TIMELINE VISUAL */}
                        <div className="relative bg-[#0D1B2A] rounded-[32px] p-8 border border-white/5 mb-8 flex-1">
                          <div className="relative flex flex-col gap-10">
                            
                            {/* Origen */}
                            <div className="flex gap-6 items-start relative z-10">
                              <div className="flex flex-col items-center pt-1.5">
                                <div className="w-5 h-5 rounded-full border-[4px] border-brand-neon bg-[#0D1B2A] z-10 shadow-[0_0_15px_rgba(var(--brand-neon-rgb),0.5)]"></div>
                                <div className="w-0.5 h-20 bg-gradient-to-b from-brand-neon to-slate-700/50 absolute top-6 left-[9px]"></div>
                              </div>
                              <div>
                                <p className="text-[10px]  font-black text-slate-500 uppercase tracking-widest mb-1">Origen</p>
                                <p className="text-2xl font-black text-white leading-none mb-1.5">{logisticsData.transport.departure_city || "Ciudad Origen"}</p>
                               <p className="text-sm text-brand-neon font-mono font-bold flex items-center gap-2">
                                <Clock size={14}/> {logisticsData.transport.departure_time ? new Date(logisticsData.transport.departure_time).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--:--'}
                              </p>
                              </div>
                            </div>

                            {/* Destino */}
                            <div className="flex gap-6 items-start relative z-10">
                              <div className="flex flex-col items-center pt-1.5">
                                <div className="w-5 h-5 rounded-full border-[4px] border-slate-600 bg-[#0D1B2A] z-10"></div>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Destino</p>
                                <p className="text-2xl font-black text-white leading-none mb-1.5">{logisticsData.transport.arrival_city || logisticsData.hotel?.ciudad || "Destino Final"}</p>
                               <p className="text-sm text-slate-400 font-mono font-bold flex items-center gap-2">
                                <Clock size={14}/> {logisticsData.transport.arrival_time ? new Date(logisticsData.transport.arrival_time).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Llegada TBC'}
                              </p>
                              </div>
                            </div>

                          </div>
                        </div>

                        <div className="mt-auto space-y-4 pt-4">
                          {logisticsData.transport.meeting_point && (
                            <div className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-start gap-4">
                              <Navigation size={24} className="text-brand-neon shrink-0 mt-1" />
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Punto de Encuentro</p>
                                <p className="text-base font-bold text-slate-200 leading-tight">{logisticsData.transport.meeting_point}</p>
                              </div>
                            </div>
                          )}
                          {logisticsData.transport.contact_phone && (
                            <div className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <Phone size={20} className="text-slate-400 shrink-0" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contacto Chofer</p>
                              </div>
                              <p className="text-base font-bold text-white tracking-widest font-mono">{logisticsData.transport.contact_phone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[40px] bg-white/5 p-10 text-center">
                         <Bus size={64} className="text-slate-600 mb-6 opacity-50" />
                         <p className="text-2xl font-black text-white uppercase italic tracking-tighter">Transporte Pendiente</p>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-3 max-w-xs">TeamFlow está confirmando los horarios de viaje.</p>
                      </div>
                    )}
                 </div>

               </div>
            )}
          </div>
        </div>
      )}

      {/* --- OTROS MODALES (INVITACIÓN, DB, FINANZAS) --- */}
      {isInviteModalOpen && (
        <InvitePlayerModal 
            isOpen={isInviteModalOpen} 
            onClose={() => setIsInviteModalOpen(false)} 
            clubId={clubId}
            torneoId={torneoId} 
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
           <div className="relative bg-[#162032] border border-white/10 w-full max-w-2xl rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-start mb-6 md:mb-8">
                 <div>
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <Users size={16} className="text-brand-neon" />
                        <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tighter leading-none">Base de Datos</h3>
                    </div>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">Fichando para: <span className="text-white font-black">{selectedTeamName}</span></p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 md:p-3 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors shrink-0"><X size={20}/></button>
              </div>

              <div className="relative mb-4 md:mb-6 shrink-0">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                 <input 
                    type="text"
                    placeholder="Buscar jugador..."
                    className="w-full bg-[#0D1B2A] border border-white/5 rounded-xl md:rounded-2xl pl-12 pr-4 py-3 md:py-4 text-white text-xs md:text-sm font-bold tracking-widest outline-none focus:border-brand-neon transition-all"
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                 />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 md:space-y-3 bg-[#0D1B2A]/30 p-2 rounded-xl md:rounded-2xl border border-white/5">
                 {filteredPlayers.length === 0 ? (
                    <div className="py-12 md:py-16 text-center flex flex-col items-center">
                       <UserPlus size={32} className="text-slate-600 mb-4 opacity-50" />
                       <p className="text-slate-400 font-black uppercase text-xs md:text-sm tracking-widest">No hay jugadores disponibles</p>
                       <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-2 px-4 leading-relaxed">Usa el botón "Enlace Invitación" en la página anterior para traer jugadores nuevos.</p>
                    </div>
                 ) : (
                    filteredPlayers.map(p => (
                       <div key={p.player_id} className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-[20px] bg-[#162032] border border-white/5 hover:border-brand-neon/50 transition-all group">
                          <div className="flex items-center gap-3 md:gap-5 min-w-0">
                             <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-black/50 flex items-center justify-center text-[10px] md:text-xs font-black text-brand-neon italic uppercase border border-white/5 shadow-inner shrink-0">
                                {p.name.charAt(0)}{p.surname?.charAt(0) || ''}
                             </div>
                             <div className="min-w-0">
                                <span className="text-xs md:text-sm font-black text-white uppercase tracking-tight block truncate">{p.name} {p.surname}</span>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-[8px] md:text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest bg-white/5 px-1.5 md:px-2 py-0.5 rounded">{p.dni || "SIN DNI"}</span>
                                    {p.team_name && p.tournament_name && p.team_name !== "Sin Equipo Asignado" && (
                                        <span className="text-[8px] md:text-[9px] text-orange-400 font-black uppercase tracking-widest flex items-center gap-1 truncate">
                                            <AlertCircle size={8} className="md:w-2.5 md:h-2.5 shrink-0" /> <span className="truncate">En {p.team_name}</span>
                                        </span>
                                    )}
                                </div>
                             </div>
                          </div>
                          <button 
                             onClick={() => handleAssign(p.player_id)}
                             className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl bg-white/5 hover:bg-brand-neon text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white hover:text-black transition-all shrink-0 ml-2"
                          >
                             <Plus size={12} className="md:w-3.5 md:h-3.5" strokeWidth={3} /> <span className="hidden sm:inline">Fichar</span>
                          </button>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      )}

      {isFinanceModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsFinanceModalOpen(false)} />
           <div className="relative bg-[#162032] border border-brand-neon/20 w-full max-w-lg rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-[0_0_50px_rgba(163,230,53,0.1)] animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-xl md:text-2xl font-display font-black text-white uppercase italic tracking-tighter">Motor de Pagos</h3>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configura cómo pagan las familias</p>
                 </div>
                 <button onClick={() => setIsFinanceModalOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 md:p-0"><X size={20} className="md:w-6 md:h-6"/></button>
              </div>

              <div className="space-y-5 md:space-y-6">
                 <div>
                    <label className="text-[9px] md:text-[10px] font-black text-brand-neon uppercase tracking-widest">1. Precio Total del Torneo</label>
                    <div className="relative mt-2">
                       <input 
                         type="number" 
                         className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-3 md:py-4 text-white font-display font-black text-xl md:text-2xl focus:border-brand-neon outline-none"
                         value={editPrice}
                         onChange={(e) => setEditPrice(e.target.value)}
                       />
                       <span className="absolute right-4 md:right-6 top-4 md:top-5 text-slate-500 font-bold text-sm md:text-base">EUR</span>
                    </div>
                 </div>

                 <div className="pt-5 md:pt-6 border-t border-white/5">
                    <label className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">2. Matrícula Inicial</label>
                    <p className="text-[10px] md:text-xs text-slate-500 mb-3 mt-1 leading-relaxed">Permite cobrar un pago inmediato (Señal) para formalizar la reserva.</p>
                    
                    <label className="flex items-center gap-3 cursor-pointer p-3 md:p-4 rounded-xl border border-white/5 bg-[#0D1B2A] hover:bg-white/5 transition-colors mb-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 md:w-5 md:h-5 rounded border-white/10 bg-black text-brand-neon focus:ring-brand-neon focus:ring-offset-0"
                        checked={hasMatricula}
                        onChange={(e) => setHasMatricula(e.target.checked)}
                      />
                      <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">Requerir Matrícula de Reserva</span>
                    </label>

                    {hasMatricula && (
                      <div className="relative animate-in slide-in-from-top-2">
                         <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-500 font-bold text-xs md:text-base">Importe:</span>
                         </div>
                         <input 
                           type="number" 
                           className="w-full bg-[#162032] border border-emerald-500/30 rounded-xl pl-16 md:pl-20 pr-10 md:pr-12 py-2.5 md:py-3 text-white font-black text-base md:text-lg focus:border-emerald-400 outline-none"
                           placeholder="100"
                           value={matriculaPrice}
                           onChange={(e) => setMatriculaPrice(e.target.value)}
                         />
                         <span className="absolute right-3 md:right-4 top-3 md:top-3 text-slate-500 font-bold text-sm md:text-base">€</span>
                      </div>
                    )}
                 </div>

                 <div className="pt-5 md:pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest">3. Opciones de Plazos (Cuotas)</label>
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-500 mb-3 md:mb-4 mt-1 leading-relaxed">
                      {hasMatricula 
                        ? `Las cuotas se calcularán sobre el restante (${(parseFloat(editPrice) || 0) - (parseFloat(matriculaPrice) || 0)}€).`
                        : "Selecciona en cuántos plazos permites que dividan el pago."}
                    </p>
                    
                    <div className="grid grid-cols-5 gap-2">
                       {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                          const isActive = allowedInstallments.includes(num);
                          return (
                             <button
                               key={num}
                               onClick={() => toggleInstallment(num)}
                               disabled={num === 1}
                               className={`py-2 md:py-3 rounded-lg md:rounded-xl font-black text-base md:text-lg transition-all ${
                                 isActive 
                                 ? 'bg-brand-neon text-brand-deep border border-brand-neon shadow-lg scale-105' 
                                 : 'bg-[#0D1B2A] text-slate-500 border border-white/5 hover:border-white/20'
                               } ${num === 1 ? 'opacity-80 cursor-not-allowed' : ''}`}
                             >
                               {num}
                             </button>
                          );
                       })}
                    </div>
                 </div>

                 <button 
                   onClick={handleSaveFinances}
                   disabled={savingFinances}
                   className="w-full py-3 md:py-4 mt-2 md:mt-4 bg-brand-neon text-brand-deep font-black uppercase text-[10px] md:text-xs tracking-widest rounded-xl md:rounded-2xl hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                 >
                   {savingFinances ? <Loader2 size={16} className="animate-spin md:w-[18px] md:h-[18px]" /> : <><Save size={16} className="md:w-[18px] md:h-[18px]" /> Guardar Configuración</>}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}