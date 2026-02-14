import React, { useEffect, useState } from "react";
import { getMyClubContext } from "../../supabase/clubService";
import { getClubTeamsWithStaff, inviteCoach, removeCoach } from "../../supabase/clubStaffService";
import { Briefcase, UserPlus, Shield, Trash2, Mail, AlertCircle, CheckCircle2, Copy, ExternalLink, Check } from "lucide-react";

export default function ClubStaff() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [statusMsg, setStatusMsg] = useState<{type: 'error'|'success', text: string} | null>(null);
  
  // Link Mágico
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { club_id } = await getMyClubContext();
      const data = await getClubTeamsWithStaff(club_id);
      setTeams(data || []);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const openAssignModal = (team: any) => {
    setSelectedTeam(team);
    setStatusMsg(null);
    setInviteLink(null);
    setEmail("");
    setIsModalOpen(true);
  };

  const handleInvite = async () => {
    if (!email || !selectedTeam) return;
    setStatusMsg(null);
    setInviteLink(null);
    
    try {
      // 1. Intentamos asignar directamente (por si el usuario ya existe en la app)
      await inviteCoach(selectedTeam.club_id, selectedTeam.id, email, "Entrenador");
      setStatusMsg({ type: 'success', text: "¡Usuario encontrado y asignado!" });
      loadData();
      setTimeout(() => setIsModalOpen(false), 1500);

    } catch (error: any) {
      // 2. SI FALLA (Usuario no existe), GENERAMOS EL LINK MÁGICO
      console.log("Usuario no encontrado, generando link de invitación...");
      
      const baseUrl = window.location.origin; // Detecta si es localhost o dominio real
      const link = `${baseUrl}/activar-staff?email=${encodeURIComponent(email)}&clubId=${selectedTeam.club_id}&teamId=${selectedTeam.id}`;
      
      setInviteLink(link);
    }
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemove = async (teamUserId: string) => {
    if (!confirm("¿Seguro que quieres quitar a este entrenador?")) return;
    try {
      await removeCoach(teamUserId);
      loadData();
    } catch (e) { alert("Error al eliminar"); }
  };

  if (loading) return <div className="p-10 text-brand-neon animate-pulse font-mono uppercase font-black">Cargando Staff...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">Cuerpo Técnico</h2>
        <p className="text-slate-400 mt-2 text-sm font-medium">Asigna entrenadores a tus equipos para que puedan gestionar sus convocatorias.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-[#162032]/40 border border-white/5 rounded-[24px] p-6 group hover:border-brand-neon/20 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <Shield size={14} className="text-purple-400" />
                   <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{team.torneos?.name}</span>
                </div>
                <h3 className="text-2xl font-display font-black text-white uppercase italic">{team.name}</h3>
              </div>
              <button onClick={() => openAssignModal(team)} className="p-2 rounded-xl bg-white/5 hover:bg-brand-neon hover:text-brand-deep text-slate-400 transition-all" title="Añadir Entrenador">
                <UserPlus size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {team.team_users && team.team_users.length > 0 ? (
                team.team_users.map((staff: any) => (
                  <div key={staff.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0D1B2A] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                        {staff.profiles?.full_name?.charAt(0) || "U"}
                      </div>
                      <div>
                         <p className="text-xs font-bold text-white uppercase">{staff.profiles?.full_name || "Usuario"}</p>
                         <p className="text-[10px] text-slate-500">{staff.profiles?.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemove(staff.id)} className="text-slate-600 hover:text-red-500 transition-colors p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sin cuerpo técnico asignado</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE ASIGNACIÓN INTELIGENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="bg-[#162032] border border-white/10 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95">
             <h3 className="text-xl font-display font-black text-white uppercase italic mb-4">
               Asignar a {selectedTeam?.name}
             </h3>

             {/* FASE 1: INPUT DE EMAIL (Si no hay link generado) */}
             {!inviteLink ? (
               <div className="space-y-4">
                  <p className="text-xs text-slate-400 mb-2">Introduce el correo del entrenador. Si no está registrado, te daremos un enlace para invitarle.</p>
                  <div className="relative">
                     <Mail className="absolute left-4 top-3.5 text-slate-500" size={16} />
                     <input 
                       type="email" 
                       placeholder="correo@ejemplo.com"
                       className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-brand-neon outline-none"
                       value={email}
                       onChange={e => setEmail(e.target.value)}
                     />
                  </div>
                  
                  {statusMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 size={14} /> {statusMsg.text}
                    </div>
                  )}

                  <button 
                    onClick={handleInvite}
                    className="w-full py-3 rounded-xl bg-brand-neon text-brand-deep font-black uppercase tracking-wider hover:bg-white transition-all mt-2"
                  >
                    Buscar y Asignar
                  </button>
               </div>
             ) : (
               // FASE 2: USUARIO NO ENCONTRADO -> MOSTRAR LINK
               <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-blue-400 text-xs font-bold flex items-center gap-2 mb-2 uppercase tracking-wider">
                      <AlertCircle size={16} /> Usuario Nuevo
                    </p>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Este correo no tiene cuenta. Envíale este <strong>enlace mágico</strong> para que active su acceso al instante:
                    </p>
                  </div>

                  {/* Input del link con botón de copiar */}
                  <div className="flex gap-2">
                    <input 
                      readOnly 
                      value={inviteLink} 
                      className="flex-1 bg-[#0D1B2A] border border-white/10 rounded-xl px-4 text-xs text-slate-400 outline-none select-all"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className={`p-3 rounded-xl font-bold transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-brand-deep hover:bg-slate-200'}`}
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>

                  {/* Botón WhatsApp */}
                  <a 
                    href={`https://wa.me/?text=Hola, te invito a unirte al staff técnico de ${selectedTeam?.name}. Activa tu cuenta aquí: ${encodeURIComponent(inviteLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-[#075E54] font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-lg"
                  >
                    Enviar por WhatsApp <ExternalLink size={16} />
                  </a>
                  
                  <button onClick={() => { setInviteLink(null); setEmail(""); }} className="w-full text-xs text-slate-500 hover:text-white mt-2">
                    Volver atrás
                  </button>
               </div>
             )}
          </div>
        </div>
      )}

    </div>
  );
}