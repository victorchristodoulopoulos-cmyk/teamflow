import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import { 
  getClubPlayers, 
  getMyClubContext, 
  JugadorRow, 
  getClubTeams, 
  EquipoRow,
  updatePlayerDetails,
  updateEnrollmentTeam
} from "../../supabase/clubService";
import { Search, ShieldCheck, Clock, X, Save, Edit3, Loader2, Users, User, Trophy, Link as LinkIcon, Check } from "lucide-react";

export default function ClubPlayers() {
  const navigate = useNavigate(); // Hook para navegar
  const [players, setPlayers] = useState<JugadorRow[]>([]);
  const [teams, setTeams] = useState<EquipoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [clubId, setClubId] = useState<string>("");

  // Estados para el Modal de Edición
  const [editingPlayer, setEditingPlayer] = useState<JugadorRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    surname: "",
    dni: "",
    birth_date: "",
    team_id: ""
  });

  // 🔥 NUEVO: Estado para el botón de Copiar Link Mágico
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { club_id } = await getMyClubContext();
      setClubId(club_id); 
      
      const [playersData, teamsData] = await Promise.all([
        getClubPlayers(club_id),
        getClubTeams(club_id)
      ]);
      
      setPlayers(playersData.filter(p => p !== null));
      setTeams(teamsData);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const filteredPlayers = players.filter(p => 
    p && p.name && `${p.name} ${p.surname || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LÓGICA DE EDICIÓN ---
  const openEditModal = (player: JugadorRow) => {
    setEditingPlayer(player);
    setEditForm({
      name: player.name || "",
      surname: player.surname || "",
      dni: player.dni || "",
      birth_date: player.birth_date || "",
      team_id: player.team_id || ""
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    setEditLoading(true);

    try {
      await updatePlayerDetails(editingPlayer.player_id, {
        name: editForm.name,
        surname: editForm.surname,
        dni: editForm.dni,
        birth_date: editForm.birth_date
      });

      if (editForm.team_id !== (editingPlayer.team_id || "")) {
        await updateEnrollmentTeam(editingPlayer.enrollment_id, editForm.team_id || null);
      }

      await loadData();
      setEditingPlayer(null);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el jugador.");
    } finally {
      setEditLoading(false);
    }
  };

  // 🔥 NUEVO: Función para copiar el link mágico de un jugador
  const handleCopyLink = (playerId: string) => {
    const link = `${window.location.origin}/vincular-hijo?player=${playerId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(playerId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="p-10 text-brand-neon animate-pulse font-mono uppercase font-black">Sincronizando Base de Datos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 relative pb-20">
      
      {/* --- HEADER OPERATIVO PRO --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 bg-[#162032]/40 border border-white/5 p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-neon rounded-full blur-[180px] opacity-[0.05] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-neon/10 border border-brand-neon/20 text-[10px] font-black text-brand-neon uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse" /> Live Roster
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
            Plantilla Total
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mt-3">
            Gestión integral de jugadores y asignación de equipos
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre..."
              className="w-full h-full min-h-[60px] bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm font-bold tracking-widest outline-none focus:border-brand-neon transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => navigate('/club-dashboard/torneos')}
            className="h-[60px] px-8 bg-brand-neon text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(var(--brand-neon-rgb),0.3)] active:scale-95"
          >
            <Trophy size={20} /> Ir a Torneos para Invitar
          </button>
        </div>
      </div>

      {/* --- ESTADÍSTICAS RÁPIDAS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         <div className="p-8 rounded-[32px] bg-[#162032]/20 border border-white/5 hover:border-white/10 transition-colors">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Users size={14} className="text-brand-neon"/> Fichas Totales</p>
            <span className="text-4xl font-display font-black text-white tracking-tighter">{players.length}</span>
         </div>
         <div className="p-8 rounded-[32px] bg-[#162032]/20 border border-white/5 hover:border-white/10 transition-colors">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldCheck size={14} className="text-brand-neon"/> Alta Confirmada</p>
            <span className="text-4xl font-display font-black text-brand-neon tracking-tighter">{players.filter(p => p.status === 'inscrito').length}</span>
         </div>
         <div className="p-8 rounded-[32px] bg-[#162032]/20 border border-white/5 hover:border-white/10 transition-colors">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={14} className="text-orange-500"/> Pendientes</p>
            <span className="text-4xl font-display font-black text-orange-400 tracking-tighter">{players.filter(p => p.status !== 'inscrito').length}</span>
         </div>
      </div>

      {/* --- TABLA DE JUGADORES --- */}
      <div className="bg-[#162032]/40 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-black/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
              <tr>
                <th className="px-10 py-6">Jugador</th>
                <th className="px-6 py-6">DNI / Pasaporte</th>
                <th className="px-6 py-6">Asignación</th>
                <th className="px-10 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPlayers.map(p => (
                <tr key={p.enrollment_id} className="group hover:bg-[#162032]/80 transition-all duration-300">
                  <td className="px-10 py-6">
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-[16px] bg-black/50 border border-white/10 flex items-center justify-center font-black text-brand-neon italic uppercase shadow-xl group-hover:scale-110 transition-transform">
                           {p.name?.charAt(0)}{p.surname?.charAt(0) || ''}
                        </div>
                        <div>
                           <p className="text-sm font-black text-white uppercase tracking-tight">{p.name} {p.surname}</p>
                           <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${p.status === 'inscrito' ? 'text-emerald-400' : 'text-orange-400'}`}>
                             {p.status || 'Procesando'}
                           </p>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-6 font-mono text-xs text-slate-400 font-bold">
                     {p.dni || "---"}
                  </td>
                  <td className="px-6 py-6">
                     <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                          {p.team_name}
                        </span>
                        <span className="text-[9px] font-bold text-brand-neon uppercase tracking-widest flex items-center gap-1">
                           • {p.tournament_name}
                        </span>
                     </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                     <div className="flex items-center justify-end gap-2">
                        {/* 🔥 NUEVO: Botón para Copiar Link de Vinculación */}
                        <button 
                           onClick={() => handleCopyLink(p.player_id)}
                           className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                             copiedId === p.player_id 
                               ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' 
                               : 'bg-white/5 border-white/5 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30'
                           }`}
                           title="Copiar Link para Padres"
                        >
                           {copiedId === p.player_id ? <Check size={14} /> : <LinkIcon size={14} />}
                           <span className="hidden sm:inline">{copiedId === p.player_id ? 'Copiado' : 'Link Familia'}</span>
                        </button>

                        <button 
                           onClick={() => openEditModal(p)}
                           className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-brand-neon hover:text-black transition-all flex items-center gap-2"
                        >
                           <Edit3 size={14} /> <span className="hidden sm:inline">Ficha</span>
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
              
              {filteredPlayers.length === 0 && (
                  <tr>
                      <td colSpan={4} className="py-32 text-center flex flex-col items-center justify-center border-none">
                          <User size={48} className="mb-6 text-slate-700 opacity-50" />
                          <p className="font-black uppercase tracking-widest text-sm text-white mb-2">No se encontraron jugadores</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Genera una invitación desde la Sala de Máquinas para añadir miembros</p>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE EDICIÓN DE JUGADOR --- */}
      {editingPlayer && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingPlayer(null)} />
          
          <div className="bg-[#0a0f18] border border-white/10 rounded-[40px] w-full max-w-2xl p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setEditingPlayer(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-3 hover:bg-white/5 rounded-full">
              <X size={20} />
            </button>

            <h3 className="text-3xl font-display font-black text-white uppercase italic mb-1">Editar Ficha</h3>
            <p className="text-sm text-slate-400 mb-8 font-medium">Modifica los datos personales o transfiere al jugador de equipo.</p>
            
            <form onSubmit={handleSaveEdit} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
                  <input 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:border-brand-neon outline-none"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>
                {/* Apellidos */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Apellidos</label>
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:border-brand-neon outline-none"
                    value={editForm.surname}
                    onChange={(e) => setEditForm({...editForm, surname: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* DNI */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">DNI / Pasaporte</label>
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono text-sm focus:border-brand-neon outline-none uppercase"
                    value={editForm.dni}
                    onChange={(e) => setEditForm({...editForm, dni: e.target.value})}
                  />
                </div>
                {/* Nacimiento */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">F. Nacimiento</label>
                  <input 
                    type="date"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:border-brand-neon outline-none [color-scheme:dark]"
                    value={editForm.birth_date}
                    onChange={(e) => setEditForm({...editForm, birth_date: e.target.value})}
                  />
                </div>
              </div>

              {/* Selector de Equipo */}
              <div className="space-y-2 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black text-brand-neon uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ShieldCheck size={12} /> Asignación de Equipo
                </label>
                <select 
                  className="w-full bg-[#162032] border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:border-brand-neon outline-none appearance-none cursor-pointer"
                  value={editForm.team_id}
                  onChange={(e) => setEditForm({...editForm, team_id: e.target.value})}
                >
                  <option value="">-- Sin equipo asignado --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1 mt-2">
                  Nota: Solo se muestran los equipos creados por tu club.
                </p>
              </div>

              {/* Botón Guardar */}
              <button 
                type="submit"
                disabled={editLoading}
                className="w-full py-5 rounded-2xl bg-brand-neon text-black font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 mt-8 flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(var(--brand-neon-rgb),0.3)] active:scale-95 text-sm"
              >
                {editLoading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Guardar Cambios</>}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}