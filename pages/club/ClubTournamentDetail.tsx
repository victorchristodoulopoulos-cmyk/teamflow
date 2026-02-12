import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyClubContext, getClubPlayers } from "../../supabase/clubService";
import { 
  getClubTournamentDetails, 
  getTournamentTeams, 
  getTeamPlayersWithFinance, // <--- FUNCIÓN NUEVA
  getTeamStaff,              // <--- FUNCIÓN NUEVA
  assignPlayerToTeam,
  TournamentConfig 
} from "../../supabase/clubTournamentService";
import { 
  Trophy, MapPin, Calendar, ArrowLeft, Shield, 
  Users, Plus, X, UserPlus, CheckCircle2, AlertCircle, Briefcase 
} from "lucide-react";

export default function ClubTournamentDetail() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<TournamentConfig | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  
  // Selección
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  
  // Datos del Equipo Seleccionado
  const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
  const [teamStaff, setTeamStaff] = useState<any[]>([]);

  // Modal Convocatoria
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);

  useEffect(() => {
    if (torneoId) loadData();
  }, [torneoId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { club_id } = await getMyClubContext();
      
      const [details, torneoTeams] = await Promise.all([
        getClubTournamentDetails(club_id, torneoId!),
        getTournamentTeams(club_id, torneoId!)
      ]);

      setTournament(details);
      setTeams(torneoTeams);

      if (torneoTeams.length > 0) {
        handleSelectTeam(torneoTeams[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeam = async (team: any) => {
    setSelectedTeamId(team.id);
    setSelectedTeamName(team.nombre);
    
    // Cargar Jugadores (con finanzas) y Staff en paralelo
    const [players, staff] = await Promise.all([
        getTeamPlayersWithFinance(team.id, torneoId!),
        getTeamStaff(team.id)
    ]);
    
    setTeamPlayers(players || []);
    setTeamStaff(staff || []);
  };

  const openAssignModal = async () => {
    if (!selectedTeamId) return;
    try {
      const { club_id } = await getMyClubContext();
      const all = await getClubPlayers(club_id);
      const currentIds = teamPlayers.map((p: any) => p.jugadores?.id);
      const available = all.filter(p => !currentIds.includes(p.id));
      setAvailablePlayers(available);
      setIsModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssign = async (playerId: string) => {
    if (!selectedTeamId) return;
    await assignPlayerToTeam(selectedTeamId, playerId);
    // Recargar datos del equipo actual para ver el nuevo jugador
    const updatedPlayers = await getTeamPlayersWithFinance(selectedTeamId, torneoId!);
    setTeamPlayers(updatedPlayers);
    setIsModalOpen(false);
  };

  if (loading) return <div className="p-10 text-brand-neon font-mono animate-pulse uppercase font-black text-center">Cargando...</div>;
  if (!tournament) return <div className="p-10 text-white">Torneo no encontrado</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/club-dashboard/torneos')} 
            className="p-4 rounded-2xl bg-[#162032] border border-white/10 text-slate-400 hover:text-white hover:scale-105 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <Trophy size={16} className="text-brand-neon" />
               <span className="text-[10px] font-black text-brand-neon uppercase tracking-widest">Panel de Torneo</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
              {tournament.torneos.nombre}
            </h1>
            <div className="flex gap-6 mt-3 text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><MapPin size={14}/> {tournament.torneos.ciudad}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(tournament.torneos.fecha).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#162032] border border-white/10 px-8 py-4 rounded-2xl text-right shadow-xl">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Coste Inscripción</p>
           <p className="text-3xl font-display font-black text-white leading-none">{tournament.precio_total}<span className="text-sm text-slate-500 ml-1">€</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR: EQUIPOS */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center px-2">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Categorías</h3>
             <button onClick={() => navigate('/club-dashboard/equipos')} className="text-[10px] font-black text-brand-neon hover:underline cursor-pointer">+ NUEVO</button>
          </div>
          
          {teams.length === 0 ? (
            <div className="p-6 rounded-2xl border-2 border-dashed border-white/10 text-center">
               <Shield size={24} className="mx-auto text-slate-700 mb-2" />
               <p className="text-xs font-bold text-slate-500 uppercase">Sin equipos</p>
            </div>
          ) : (
            teams.map(team => (
              <button
                key={team.id}
                onClick={() => handleSelectTeam(team)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                  selectedTeamId === team.id 
                  ? "bg-brand-neon text-brand-deep border-brand-neon shadow-lg" 
                  : "bg-[#162032]/60 border-white/5 text-slate-400 hover:border-white/20 hover:bg-[#162032]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield size={18} className={selectedTeamId === team.id ? "opacity-100" : "opacity-40"} />
                  <span className="text-xs font-black uppercase italic tracking-wider">{team.nombre}</span>
                </div>
                {selectedTeamId === team.id && <div className="w-2 h-2 rounded-full bg-brand-deep animate-pulse"></div>}
              </button>
            ))
          )}
        </div>

        {/* MAIN AREA */}
        <div className="lg:col-span-3 space-y-6">
          
          {selectedTeamId ? (
            <>
              {/* 1. SECCIÓN STAFF (ENTRENADOR) */}
              <div className="bg-[#162032]/40 border border-white/5 rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                       <Briefcase size={24} />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-white uppercase tracking-wider">Cuerpo Técnico</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase">Entrenadores asignados a {selectedTeamName}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    {teamStaff.length > 0 ? (
                       teamStaff.map(staff => (
                          <div key={staff.id} className="flex items-center gap-2 px-4 py-2 bg-[#0D1B2A] rounded-xl border border-white/10">
                             <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                                {staff.profiles?.full_name?.charAt(0) || "S"}
                             </div>
                             <span className="text-xs font-bold text-slate-300 uppercase">{staff.profiles?.full_name || "Sin nombre"}</span>
                          </div>
                       ))
                    ) : (
                       <span className="text-xs text-slate-600 font-bold uppercase italic px-4">Sin entrenador asignado</span>
                    )}
                    <button onClick={() => navigate('/club-dashboard/staff')} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                       <Plus size={16} />
                    </button>
                 </div>
              </div>

              {/* 2. LISTA DE JUGADORES (MODO FINANCIERO) */}
              <div className="bg-[#162032]/40 border border-white/5 rounded-[32px] overflow-hidden min-h-[500px] flex flex-col">
                
                {/* Header de la Tabla */}
                <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0D1B2A]/30">
                  <div>
                     <h2 className="text-3xl font-display font-black text-white uppercase italic tracking-tight">{selectedTeamName}</h2>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                       Estado de Plantilla y Pagos
                     </p>
                  </div>
                  <button 
                    onClick={openAssignModal}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-neon text-brand-deep font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]"
                  >
                    <UserPlus size={16} strokeWidth={2.5} />
                    Añadir Jugador
                  </button>
                </div>

                {/* Tabla de Jugadores */}
                <div className="flex-1">
                   {teamPlayers.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-24">
                         <Users size={64} className="text-slate-500 mb-6" />
                         <p className="text-slate-300 font-black uppercase tracking-widest">Plantilla vacía</p>
                         <p className="text-slate-500 text-xs mt-2 max-w-xs">Añade jugadores para gestionar su inscripción y pagos.</p>
                      </div>
                   ) : (
                      <div className="divide-y divide-white/5">
                         {/* Cabecera Columnas (Visible en desktop) */}
                         <div className="hidden md:grid grid-cols-12 px-8 py-4 bg-[#0D1B2A]/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <div className="col-span-5">Jugador</div>
                            <div className="col-span-3">DNI / ID</div>
                            <div className="col-span-3 text-right">Estado Pagos</div>
                            <div className="col-span-1"></div>
                         </div>

                         {/* Filas */}
                         {teamPlayers.map(tp => {
                            const pending = tournament.precio_total - (tp.totalPaid || 0);
                            const isPaid = pending <= 0;
                            
                            return (
                              <div key={tp.id} className="grid grid-cols-1 md:grid-cols-12 items-center px-8 py-5 hover:bg-white/[0.02] transition-colors group gap-4 md:gap-0">
                                 {/* Jugador */}
                                 <div className="col-span-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#162032] to-[#0D1B2A] border border-white/10 flex items-center justify-center font-black text-slate-400 text-xs group-hover:text-white transition-colors">
                                       {tp.jugadores?.name?.charAt(0)}
                                    </div>
                                    <span className="text-sm font-black text-slate-200 uppercase group-hover:text-white transition-colors">
                                       {tp.jugadores?.name} {tp.jugadores?.surname}
                                    </span>
                                 </div>

                                 {/* DNI */}
                                 <div className="col-span-3 text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
                                    {tp.jugadores?.dni || "---"}
                                 </div>

                                 {/* Estado Financiero */}
                                 <div className="col-span-3 flex justify-end">
                                    {isPaid ? (
                                       <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                          <CheckCircle2 size={14} className="text-emerald-500" />
                                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Pagado</span>
                                       </div>
                                    ) : (
                                       <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                          <AlertCircle size={14} className="text-orange-500" />
                                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                                             Debe {pending}€
                                          </span>
                                       </div>
                                    )}
                                 </div>
                                 
                                 {/* Acciones */}
                                 <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                                       <X size={16} />
                                    </button>
                                 </div>
                              </div>
                            );
                         })}
                      </div>
                   )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 p-12 border-2 border-dashed border-white/5 rounded-[32px]">
               <Shield size={48} className="mb-6 opacity-20" />
               <p className="font-bold uppercase tracking-widest text-sm">Selecciona una categoría</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL (Sin cambios funcionales, solo visuales si quieres) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
           <div className="relative bg-[#162032] border border-white/10 w-full max-w-xl rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">Plantilla Club</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Selecciona jugadores para añadir al equipo</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                 {availablePlayers.length === 0 ? (
                    <div className="py-10 text-center">
                       <p className="text-slate-500 font-bold uppercase text-sm">No hay más jugadores disponibles</p>
                    </div>
                 ) : (
                    availablePlayers.map(p => (
                       <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#0D1B2A] border border-white/5 hover:border-brand-neon transition-all group cursor-pointer" onClick={() => handleAssign(p.id)}>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-white group-hover:bg-brand-neon/20 transition-colors">
                                {p.name.charAt(0)}
                             </div>
                             <div>
                                <span className="text-sm font-black text-slate-300 uppercase group-hover:text-white transition-colors">{p.name} {p.surname}</span>
                                <p className="text-[10px] text-slate-600 font-bold uppercase">{p.dni || "SIN DNI"}</p>
                             </div>
                          </div>
                          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-brand-neon group-hover:border-brand-neon transition-all">
                             <Plus size={16} className="text-slate-500 group-hover:text-brand-deep" strokeWidth={3} />
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}