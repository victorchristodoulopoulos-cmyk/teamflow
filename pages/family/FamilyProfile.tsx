import { useState } from "react";
import { useFamily } from "../../context/FamilyContext";
import { supabase } from "../../supabase/supabaseClient";
import { 
  User, Mail, Edit2, Save, X, Calendar, 
  CreditCard, Loader2, Shield 
} from "lucide-react";

export default function FamilyProfile() {
  // IMPORTANTE: Traemos refreshProfile del contexto
  const { players, refreshProfile } = useFamily();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    dni: "",
    birth_date: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const raw = localStorage.getItem("session");
  const email = raw ? (() => { try { return JSON.parse(raw).email; } catch { return ""; } })() : "";

  const handleEditClick = (player: any) => {
    setEditingId(player.id);
    setFormData({
      name: player.name || "",
      surname: player.surname || "",
      dni: player.dni || "",
      birth_date: player.birth_date || ""
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", surname: "", dni: "", birth_date: "" });
  };

  const handleSave = async (playerId: string) => {
    setIsSaving(true);
    try {
      // 1. Guardamos en Supabase
      const { error } = await supabase
        .from("jugadores")
        .update({
          name: formData.name,
          surname: formData.surname,
          dni: formData.dni,
          birth_date: formData.birth_date || null
        })
        .eq("id", playerId);

      if (error) throw error;

      // 2. ¡MAGIA! Recargamos los datos del contexto para actualizar la UI
      await refreshProfile();
      
      // 3. Cerramos el modo edición
      setEditingId(null);
      
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar. Asegúrate de tener permisos.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* CABECERA */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#162032]/80 border border-white/10 p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-neon rounded-full blur-[150px] opacity-5 pointer-events-none"></div>

        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#162032] to-[#0D1B2A] border border-white/10 flex items-center justify-center shadow-2xl shrink-0 relative z-10">
            <User size={40} className="text-slate-400" />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-brand-neon rounded-full border-4 border-[#0D1B2A]"></div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
            <h2 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase">Cuenta Familiar</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-slate-400">
                <Mail size={16} className="text-brand-neon" />
                <span className="text-sm font-bold tracking-wide">{email || "usuario@teamflow.com"}</span>
            </div>
        </div>
        
        <div className="z-10">
          <button 
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-xs font-black transition-all uppercase tracking-widest border border-white/5"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* LISTADO DE JUGADORES */}
      <div>
        <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3">
          <Shield className="text-brand-neon" size={24} />
          Mis Jugadores ({players.length})
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {players.map((player) => {
            const isEditing = editingId === player.id;

            return (
              <div 
                key={player.id} 
                className={`relative overflow-hidden rounded-[24px] p-8 transition-all duration-300 ${
                  isEditing 
                    ? "bg-[#162032] border-2 border-brand-neon shadow-[0_0_40px_rgba(var(--accent-rgb),0.1)]" 
                    : "bg-[#162032]/40 border border-white/5 hover:border-white/10"
                }`}
              >
                {/* CABECERA TARJETA */}
                <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-colors ${
                      isEditing ? "bg-brand-neon text-[#0D1B2A]" : "bg-[#0D1B2A] text-slate-500 border border-white/5"
                    }`}>
                      {player.name ? player.name.charAt(0) : "?"}
                    </div>
                    <div>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Expediente</p>
                       <h4 className="text-xl font-bold text-white uppercase italic tracking-tight">
                         {isEditing ? "Editando Ficha..." : player.name}
                       </h4>
                    </div>
                  </div>

                  {!isEditing && (
                    <button 
                      onClick={() => handleEditClick(player)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white hover:text-brand-neon transition-colors"
                      title="Editar ficha"
                    >
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
                          <input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-neon focus:outline-none"
                          />
                        ) : (
                          <p className="text-white font-bold text-lg">{player.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Apellidos</label>
                        {isEditing ? (
                          <input 
                            value={formData.surname}
                            onChange={(e) => setFormData({...formData, surname: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-neon focus:outline-none"
                          />
                        ) : (
                          <p className="text-white font-bold text-lg">{player.surname || "---"}</p>
                        )}
                      </div>
                   </div>

                   {/* DNI Y FECHA */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                           <CreditCard size={10} /> DNI / Pasaporte
                        </label>
                        {isEditing ? (
                          <input 
                            value={formData.dni}
                            onChange={(e) => setFormData({...formData, dni: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-neon focus:outline-none font-mono"
                          />
                        ) : (
                          <p className="text-slate-300 font-mono text-sm tracking-wider">{player.dni || "No registrado"}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                           <Calendar size={10} /> Nacimiento
                        </label>
                        {isEditing ? (
                          <input 
                            type="date"
                            value={formData.birth_date}
                            onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-neon focus:outline-none [color-scheme:dark]"
                          />
                        ) : (
                          <p className="text-slate-300 font-mono text-sm">
                            {player.birth_date 
                              ? new Date(player.birth_date).toLocaleDateString() 
                              : "No registrada"}
                          </p>
                        )}
                      </div>
                   </div>

                   {/* BOTONES */}
                   {isEditing && (
                     <div className="pt-4 mt-4 border-t border-white/10 flex gap-3 animate-in fade-in slide-in-from-top-2">
                        <button 
                          onClick={() => handleSave(player.id)}
                          disabled={isSaving}
                          className="flex-1 py-3 rounded-xl bg-brand-neon text-brand-deep font-black text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
                        >
                          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                          Guardar
                        </button>
                        <button 
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="px-6 py-3 rounded-xl bg-white/5 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                          <X size={16} /> Cancelar
                        </button>
                     </div>
                   )}

                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="text-center pb-10">
        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
           v2.5.0 • Datos protegidos
        </p>
      </div>

    </div>
  );
}