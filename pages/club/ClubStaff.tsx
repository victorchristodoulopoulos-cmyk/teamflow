import React, { useEffect, useState } from "react";
import { getMyClubContext } from "../../supabase/clubService";
import { supabase } from "../../supabase/supabaseClient"; 
import { Briefcase, Shield, Copy, Check, Loader2, Users, Link as LinkIcon, Trophy, X, Save } from "lucide-react";

export default function ClubStaff() {
  const [loading, setLoading] = useState(true);
  const [clubId, setClubId] = useState<string>("");
  
  // Datos
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  
  // UI States
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { club_id } = await getMyClubContext();
      setClubId(club_id);

      // 1. Obtener la Bolsa de Staff (Usuarios con rol staff que pertenecen a este club)
      const { data: staffData } = await supabase
        .from('profiles')
        .select('*')
        .eq('club_id', club_id)
        .eq('role', 'staff');
      
      setStaffMembers(staffData || []);

      // 2. Obtener todos los equipos del club con el nombre de su torneo
      const { data: teamsData } = await supabase
        .from('equipos')
        .select('*, torneos(name)')
        .eq('club_id', club_id);
        
      setTeams(teamsData || []);

      // 3. Obtener todas las asignaciones de staff a equipos
      if (staffData && staffData.length > 0) {
        const staffIds = staffData.map(s => s.id);
        const { data: tuData } = await supabase
          .from('team_users')
          .select('*')
          .in('user_id', staffIds);
        setTeamUsers(tuData || []);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    // 🔥 Este es el enlace mágico que le enviarás a tus entrenadores
    const link = `${window.location.origin}/registro-staff?club=${clubId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openAssignModal = (staff: any) => {
    setSelectedStaff(staff);
    // Buscar a qué equipos está asignado actualmente este entrenador
    const currentAssigned = teamUsers.filter(tu => tu.user_id === staff.id).map(tu => tu.team_id);
    setSelectedTeamIds(currentAssigned);
    setIsModalOpen(true);
  };

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeamIds(prev => 
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!selectedStaff) return;
    setSaving(true);
    try {
      // 1. Borramos todas las asignaciones actuales de este entrenador en este club
      await supabase.from('team_users').delete().eq('user_id', selectedStaff.id);

      // 2. Insertamos las nuevas asignaciones
      if (selectedTeamIds.length > 0) {
        const inserts = selectedTeamIds.map(tId => ({
          team_id: tId,
          user_id: selectedStaff.id,
          role: 'Entrenador'
        }));
        await supabase.from('team_users').insert(inserts);
      }
      
      // 3. Recargamos los datos para reflejar los cambios en la pantalla
      await loadData();
      setIsModalOpen(false);
    } catch (e) {
      alert("Error guardando asignaciones.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-neon" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      
      {/* 🚀 HEADER Y BOTÓN DE INVITACIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#162032] border border-white/5 p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-neon/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-neon/10 text-brand-neon text-[10px] font-black uppercase tracking-widest border border-brand-neon/20 mb-4">
            <Briefcase size={12} /> Gestión de Personal
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
            Staff
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl text-sm leading-relaxed">
            Invita a tus entrenadores y asígnalos a los diferentes equipos y torneos de tu club.
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 text-center md:text-left">Enlace de Registro para Staff</p>
          <button 
            onClick={handleCopyLink}
            className={`w-full md:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
              copied 
                ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400' 
                : 'bg-brand-neon text-brand-deep hover:bg-white border border-brand-neon shadow-[0_0_20px_rgba(163,230,53,0.2)]'
            }`}
          >
            {copied ? <Check size={18} /> : <LinkIcon size={18} />}
            {copied ? '¡Enlace Copiado!' : 'Copiar Enlace Privado'}
          </button>
        </div>
      </div>

      {/* 🚀 GRID DE ENTRENADORES */}
      <div>
        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-2">
          <Users className="text-brand-neon" size={20}/> Plantilla Técnica ({staffMembers.length})
        </h3>
        
        {staffMembers.length === 0 ? (
          <div className="text-center py-20 bg-[#162032]/40 rounded-[32px] border-2 border-dashed border-white/5">
            <Briefcase size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">Tu bolsa de staff está vacía</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">Copia el enlace de arriba y envíaselo a tus entrenadores por WhatsApp. Aparecerán aquí en cuanto se registren.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {staffMembers.map((staff) => {
              // Buscar los equipos a los que está asignado este entrenador
              const assignedTeamIds = teamUsers.filter(tu => tu.user_id === staff.id).map(tu => tu.team_id);
              const assignedTeams = teams.filter(t => assignedTeamIds.includes(t.id));

              return (
                <div key={staff.id} className="bg-[#0D1B2A] border border-white/10 rounded-[32px] p-6 shadow-xl hover:border-brand-neon/30 transition-all flex flex-col group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#162032] border border-white/5 text-brand-neon flex items-center justify-center font-black text-xl italic uppercase shadow-inner group-hover:scale-110 transition-transform">
                      {staff.full_name?.charAt(0) || "S"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-black text-white uppercase tracking-tight truncate">{staff.full_name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{staff.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 bg-[#162032] rounded-2xl p-4 border border-white/5 mb-6">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Shield size={10} /> Equipos Asignados
                    </p>
                    {assignedTeams.length === 0 ? (
                      <p className="text-xs text-slate-600 font-bold italic">En el banquillo (Sin asignar)</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {assignedTeams.map(t => (
                          <div key={t.id} className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg">
                            <p className="text-xs font-black text-white uppercase">{t.name}</p>
                            <p className="text-[8px] text-brand-neon font-bold uppercase tracking-widest truncate max-w-[120px]">{t.torneos?.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => openAssignModal(staff)}
                    className="w-full py-3.5 rounded-xl bg-white/5 text-white font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-brand-neon hover:text-brand-deep hover:border-brand-neon transition-all"
                  >
                    Gestionar Asignaciones
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==========================================
          🚀 MODAL: ASIGNAR EQUIPOS AL ENTRENADOR
          ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
           <div className="relative bg-[#162032] border border-brand-neon/20 w-full max-w-2xl rounded-[32px] p-6 md:p-8 shadow-[0_0_50px_rgba(163,230,53,0.15)] animate-in zoom-in-95 max-h-[85vh] flex flex-col">
              
              <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                 <div>
                    <h3 className="text-xl md:text-2xl font-display font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                      <Briefcase className="text-brand-neon" /> Asignar Pizarra
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Entrenador: <span className="text-white">{selectedStaff?.full_name}</span>
                    </p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-2 bg-white/5 rounded-full"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 mb-6">
                 {teams.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">
                       <Shield size={40} className="mx-auto mb-4 opacity-50" />
                       <p className="text-sm font-bold text-white">No hay equipos creados</p>
                       <p className="text-[10px] font-black uppercase tracking-widest mt-2">Crea equipos en la gestión de torneos primero.</p>
                    </div>
                 ) : (
                    teams.map(team => {
                      const isSelected = selectedTeamIds.includes(team.id);
                      return (
                         <div 
                           key={team.id} 
                           onClick={() => toggleTeamSelection(team.id)}
                           className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                             isSelected 
                               ? 'bg-brand-neon/10 border-brand-neon shadow-[0_0_15px_rgba(163,230,53,0.1)]' 
                               : 'bg-[#0D1B2A] border-white/5 hover:border-white/20'
                           }`}
                         >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'border-brand-neon bg-brand-neon' : 'border-slate-600 bg-transparent'
                            }`}>
                               {isSelected && <Check size={14} className="text-brand-deep" strokeWidth={4} />}
                            </div>
                            <div className="min-w-0 flex-1">
                               <p className={`text-base font-black uppercase truncate transition-colors ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                 {team.name}
                               </p>
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 flex items-center gap-1.5 truncate">
                                 <Trophy size={10} className={isSelected ? 'text-brand-neon' : 'text-slate-600'} /> {team.torneos?.name}
                               </p>
                            </div>
                         </div>
                      )
                    })
                 )}
              </div>

              <button 
                onClick={handleSaveAssignments}
                disabled={saving}
                className="w-full py-4 rounded-xl bg-brand-neon text-brand-deep font-black uppercase text-xs tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shrink-0"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Guardar Asignaciones</>}
              </button>
           </div>
        </div>
      )}

    </div>
  );
}