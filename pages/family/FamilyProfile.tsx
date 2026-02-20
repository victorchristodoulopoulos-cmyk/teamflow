import { useState, useEffect } from "react";
import { useFamily } from "../../context/FamilyContext";
import { supabase } from "../../supabase/supabaseClient";
import { 
  User, Mail, Edit2, Save, X, Calendar, 
  CreditCard, Loader2, Shield, Crosshair, Users, LogOut // 👈 ¡Faltaba LogOut!
} from "lucide-react";

export default function FamilyProfile() {
  const { players, refreshProfile } = useFamily();
  
  // ESTADOS DEL PADRE/TUTOR
  const [parentData, setParentData] = useState({ id: "", full_name: "", dni: "", email: "" });
  const [isEditingParent, setIsEditingParent] = useState(false);
  const [savingParent, setSavingParent] = useState(false);

  // ESTADOS DEL JUGADOR
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    dni: "",
    birth_date: "",
    actual_team: "",
    position: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Cargar datos del tutor al iniciar
    const fetchParentData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (profile) {
          setParentData({ 
            id: user.id,
            full_name: profile.full_name || "", 
            dni: profile.dni || "", 
            email: profile.email || user.email 
          });
        }
      }
    };
    fetchParentData();
  }, []);

  // --- HANDLERS DEL TUTOR ---
  const handleSaveParent = async () => {
    setSavingParent(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: parentData.full_name,
          dni: parentData.dni
        })
        .eq("id", parentData.id);

      if (error) throw error;
      setIsEditingParent(false);
    } catch (error) {
      console.error("Error al guardar tutor:", error);
      alert("Hubo un error al actualizar tus datos.");
    } finally {
      setSavingParent(false);
    }
  };

  // --- HANDLERS DEL JUGADOR ---
  const handleEditClick = (player: any) => {
    setEditingId(player.id);
    setFormData({
      name: player.name || "",
      surname: player.surname || "",
      dni: player.dni || "",
      birth_date: player.birth_date || "",
      actual_team: player.actual_team || "",
      position: player.position || ""
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", surname: "", dni: "", birth_date: "", actual_team: "", position: "" });
  };

  const handleSavePlayer = async (playerId: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("jugadores")
        .update({
          name: formData.name,
          surname: formData.surname,
          dni: formData.dni,
          birth_date: formData.birth_date || null,
          actual_team: formData.actual_team,
          position: formData.position
        })
        .eq("id", playerId);

      if (error) throw error;
      await refreshProfile();
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar jugador:", error);
      alert("Hubo un error al guardar. Asegúrate de tener permisos.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* TARJETA DEL TUTOR (PADRE/MADRE) */}
      <div className={`relative overflow-hidden rounded-[32px] p-8 transition-all duration-300 ${
        isEditingParent ? "bg-[#162032] border-2 border-brand-neon" : "bg-[#162032]/80 border border-white/10"
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-neon rounded-full blur-[150px] opacity-5 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0D1B2A] to-black border border-white/10 flex items-center justify-center shadow-2xl shrink-0 relative">
                <User size={32} className="text-brand-neon" />
            </div>
            <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Tutor Legal / Responsable</p>
                <h2 className="text-2xl font-display font-black text-white italic tracking-tight uppercase">
                  {isEditingParent ? "Editando Perfil..." : (parentData.full_name || "Completar Perfil")}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-slate-400">
                    <Mail size={14} />
                    <span className="text-xs font-bold tracking-wide">{parentData.email}</span>
                </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {!isEditingParent && (
              <button onClick={() => setIsEditingParent(true)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all uppercase tracking-widest flex items-center gap-2">
                <Edit2 size={14} /> Editar
              </button>
            )}
            <button onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }} className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all uppercase tracking-widest flex items-center gap-2">
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>

        {/* MODO EDICIÓN TUTOR */}
        {isEditingParent ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nombre y Apellidos</label>
              <input value={parentData.full_name} onChange={(e) => setParentData({...parentData, full_name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-brand-neon outline-none" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">DNI / Pasaporte</label>
              <input value={parentData.dni} onChange={(e) => setParentData({...parentData, dni: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-brand-neon outline-none font-mono" />
            </div>
            <div className="md:col-span-2 pt-4 flex gap-3">
              <button onClick={handleSaveParent} disabled={savingParent} className="flex-1 py-3 bg-brand-neon text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all flex justify-center items-center gap-2">
                {savingParent ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Guardar Tutor
              </button>
              <button onClick={() => setIsEditingParent(false)} disabled={savingParent} className="px-8 py-3 bg-white/5 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                <X size={16}/> Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">DNI / Identificación</p>
              <p className="text-white font-mono text-sm">{parentData.dni || "---"}</p>
            </div>
          </div>
        )}
      </div>

      {/* LISTADO DE JUGADORES */}
      <div>
        <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3">
          <Shield className="text-blue-400" size={24} />
          Mis Jugadores ({players.length})
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {players.map((player) => {
            const isEditing = editingId === player.id;

            return (
              <div 
                key={player.id} 
                className={`relative overflow-hidden rounded-[24px] p-8 transition-all duration-300 ${
                  isEditing ? "bg-[#162032] border-2 border-blue-400 shadow-xl" : "bg-[#162032]/40 border border-white/5 hover:border-white/10"
                }`}
              >
                {/* CABECERA TARJETA JUGADOR */}
                <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-colors ${
                      isEditing ? "bg-blue-400 text-black" : "bg-[#0D1B2A] text-slate-500 border border-white/5"
                    }`}>
                      {player.name ? player.name.charAt(0) : "?"}
                    </div>
                    <div>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Expediente Deportivo</p>
                       <h4 className="text-xl font-bold text-white uppercase italic tracking-tight">
                         {isEditing ? "Editando Ficha..." : player.name}
                       </h4>
                    </div>
                  </div>

                  {!isEditing && (
                    <button onClick={() => handleEditClick(player)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white hover:text-blue-400 transition-colors" title="Editar ficha">
                      <Edit2 size={18} />
                    </button>
                  )}
                </div>

                {/* FORMULARIO / VISTA */}
                <div className="space-y-5">
                   
                   {/* NOMBRE Y APELLIDOS */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nombre</label>
                        {isEditing ? (
                          <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-400 outline-none" />
                        ) : (
                          <p className="text-white font-bold text-lg">{player.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Apellidos</label>
                        {isEditing ? (
                          <input value={formData.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-400 outline-none" />
                        ) : (
                          <p className="text-white font-bold text-lg">{player.surname || "---"}</p>
                        )}
                      </div>
                   </div>

                   {/* DNI Y FECHA */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><CreditCard size={10} /> DNI / Pasaporte</label>
                        {isEditing ? (
                          <input value={formData.dni} onChange={(e) => setFormData({...formData, dni: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-400 outline-none font-mono" />
                        ) : (
                          <p className="text-slate-300 font-mono text-sm tracking-wider">{player.dni || "---"}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Calendar size={10} /> Nacimiento</label>
                        {isEditing ? (
                          <input type="date" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-400 outline-none [color-scheme:dark]" />
                        ) : (
                          <p className="text-slate-300 font-mono text-sm">
                            {player.birth_date ? new Date(player.birth_date).toLocaleDateString() : "---"}
                          </p>
                        )}
                      </div>
                   </div>

                   {/* 🔥 NUEVO: EQUIPO Y POSICIÓN */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Users size={10} /> Equipo Procedencia</label>
                        {isEditing ? (
                          <input value={formData.actual_team} onChange={(e) => setFormData({...formData, actual_team: e.target.value})} placeholder="Ej: FCB Benjamín" className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-400 outline-none" />
                        ) : (
                          <p className="text-slate-300 text-sm font-bold">{player.actual_team || "---"}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Crosshair size={10} /> Posición</label>
                        {isEditing ? (
                          <select value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-400 outline-none appearance-none">
                            <option value="">Seleccionar...</option>
                            <option value="Portero">Portero</option>
                            <option value="Defensa">Defensa</option>
                            <option value="Centrocampista">Centrocampista</option>
                            <option value="Delantero">Delantero</option>
                          </select>
                        ) : (
                          <div className="inline-block px-2 py-1 bg-white/5 rounded text-xs font-bold text-slate-300">
                            {player.position || "---"}
                          </div>
                        )}
                      </div>
                   </div>

                   {/* BOTONES GUARDAR JUGADOR */}
                   {isEditing && (
                     <div className="pt-4 mt-4 border-t border-white/10 flex gap-3 animate-in fade-in slide-in-from-top-2">
                        <button onClick={() => handleSavePlayer(player.id)} disabled={isSaving} className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-400 transition-all flex justify-center gap-2">
                          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Guardar
                        </button>
                        <button onClick={handleCancel} disabled={isSaving} className="px-6 py-3 rounded-xl bg-white/5 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                          <X size={16} />
                        </button>
                     </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}