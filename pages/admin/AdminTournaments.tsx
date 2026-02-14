import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { 
  Trophy, Plus, Calendar, MapPin, Trash2, Loader2, CheckCircle, 
  AlertCircle, Search, Edit3, X, Database 
} from "lucide-react";

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el Modal / SidePanel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    fecha: "",
    ciudad: "",
    estado: "activo"
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('torneos')
      .select('*')
      .order('fecha', { ascending: false });
    
    if (!error && data) setTournaments(data);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingTournament(null);
    setFormData({ name: "", fecha: "", ciudad: "", estado: "activo" });
    setIsPanelOpen(true);
  };

  const openEdit = (t: any) => {
    setEditingTournament(t);
    setFormData({
        name: t.name || "",
        fecha: t.fecha || "",
        ciudad: t.ciudad || "",
        estado: t.estado || "activo"
    });
    setIsPanelOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    const payload = { ...formData };

    let error;
    if (editingTournament) {
      const { error: err } = await supabase.from('torneos').update(payload).eq('id', editingTournament.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('torneos').insert([payload]);
      error = err;
    }

    if (error) {
      setStatusMsg({ type: 'error', text: error.message });
    } else {
      setStatusMsg({ type: 'success', text: editingTournament ? "Evento actualizado" : "Evento creado en Supabase" });
      setTimeout(() => {
        setIsPanelOpen(false);
        fetchTournaments();
        setStatusMsg(null);
      }, 1000);
    }
    setFormLoading(false);
  };

  const deleteTournament = async (id: string) => {
    if (!confirm("¿Borrar evento crítico? Esto puede afectar a las inscripciones de los clubes.")) return;
    const { error } = await supabase.from('torneos').delete().eq('id', id);
    if (!error) fetchTournaments();
  };

  const filteredTournaments = tournaments.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.ciudad && t.ciudad.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-10 lg:pt-0">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 rounded-2xl bg-brand-neon/10 border border-brand-neon/20">
                <Database size={24} className="text-brand-neon" />
             </div>
             <h1 className="text-5xl font-display font-black tracking-tighter italic text-white uppercase leading-none">Gestión Eventos</h1>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand-neon animate-pulse"></span>
            Base de datos global de torneos
          </p>
        </div>
        <button 
          onClick={openCreate}
          className="bg-brand-neon hover:bg-white text-black px-8 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-brand-neon/10 hover:scale-105"
        >
          <Plus size={20} /> Crear Torneo
        </button>
      </header>

      {/* BARRA BÚSQUEDA */}
      <div className="bg-[#162032]/40 border border-white/5 p-4 rounded-[32px] flex items-center gap-4">
        <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-neon transition-colors" size={18} />
            <input 
                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-16 pr-6 py-5 text-white outline-none focus:border-brand-neon/30 transition-all font-bold text-sm tracking-wide"
                placeholder="Filtrar por nombre o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="hidden md:flex items-center gap-2 px-6 border-l border-white/5">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Eventos:</span>
            <span className="text-sm font-black text-brand-neon">{tournaments.length}</span>
        </div>
      </div>

      {/* LISTA TORNEOS */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center animate-pulse font-black text-slate-600 tracking-widest italic">Sincronizando con Supabase...</div>
        ) : (
          filteredTournaments.map((t) => (
            <div key={t.id} className="bg-[#162032]/40 border border-white/5 p-6 md:p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-[#162032]/80 transition-all">
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#0D1B2A] flex items-center justify-center text-orange-500 border border-white/5 group-hover:scale-110 transition-all shadow-inner shrink-0">
                  <Trophy size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">{t.name}</h3>
                  <div className="flex items-center gap-6 mt-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em]">
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-brand-neon"/> {t.fecha || 'TBC'}</span>
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-brand-neon"/> {t.ciudad || 'Por confirmar'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                 <div className="text-right">
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1.5">Status Central</p>
                    <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border ${t.estado === 'activo' ? 'border-brand-neon/30 text-brand-neon bg-brand-neon/10' : 'border-slate-700 text-slate-500 bg-black/50'}`}>
                      {t.estado || 'N/A'}
                    </span>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => openEdit(t)} className="p-4 rounded-xl bg-white/5 text-slate-400 hover:text-brand-neon hover:bg-brand-neon/10 transition-all">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => deleteTournament(t.id)} className="p-4 rounded-xl bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
                      <Trash2 size={18} />
                    </button>
                 </div>
              </div>
            </div>
          ))
        )}
        
        {!loading && filteredTournaments.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[32px] bg-[#162032]/20">
                <Trophy size={48} className="mx-auto text-slate-700 mb-4 opacity-50" />
                <p className="font-black uppercase tracking-widest text-white">No se han encontrado eventos</p>
            </div>
        )}
      </div>

      {/* --- SIDE PANEL: CREATE / EDIT --- */}
      {isPanelOpen && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in" onClick={() => setIsPanelOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#0a0f18] border-l border-white/5 z-[110] shadow-2xl p-12 overflow-y-auto animate-in slide-in-from-right duration-500">
             <div className="flex justify-between items-center mb-16">
                <div>
                   <h2 className="text-4xl font-display font-black italic uppercase text-white tracking-tighter">
                     {editingTournament ? "Editar Evento" : "Nuevo Evento"}
                   </h2>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">God Mode Configurator</p>
                </div>
                <button onClick={() => setIsPanelOpen(false)} className="p-4 rounded-2xl bg-white/5 text-slate-500 hover:text-white transition-colors">
                   <X size={24} />
                </button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-8">
                {statusMsg && (
                    <div className={`p-5 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4 ${statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {statusMsg.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                        <span className="text-xs font-black uppercase tracking-widest">{statusMsg.text}</span>
                    </div>
                )}

                <div className="space-y-4">
                   <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Nombre Oficial del Torneo</label>
                   <input 
                     required
                     className="w-full bg-black/40 border border-white/10 rounded-[24px] px-8 py-6 text-white focus:border-brand-neon outline-none transition-all font-bold text-lg shadow-inner"
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     placeholder="Ej: MadCup 2026"
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Fecha</label>
                        <input 
                            type="date"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-brand-neon outline-none transition-all font-bold [color-scheme:dark]"
                            value={formData.fecha}
                            onChange={e => setFormData({...formData, fecha: e.target.value})}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Ciudad / Sede</label>
                        <input 
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-brand-neon outline-none transition-all font-bold"
                            value={formData.ciudad}
                            onChange={e => setFormData({...formData, ciudad: e.target.value})}
                            placeholder="Ej: Madrid"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Estado del Evento</label>
                    <select 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-brand-neon outline-none transition-all font-bold appearance-none cursor-pointer"
                        value={formData.estado}
                        onChange={e => setFormData({...formData, estado: e.target.value})}
                    >
                        <option value="activo">Activo (Visible para clubes)</option>
                        <option value="boceto">Boceto (Oculto)</option>
                        <option value="finalizado">Finalizado (Histórico)</option>
                    </select>
                </div>

                <div className="pt-10 border-t border-white/5">
                   <button 
                     type="submit" 
                     disabled={formLoading}
                     className="w-full bg-brand-neon hover:bg-white text-black h-20 rounded-[30px] font-black uppercase text-sm tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand-neon/20 active:scale-95"
                   >
                     {formLoading ? <Loader2 className="animate-spin" /> : editingTournament ? "Guardar Cambios" : "Confirmar Evento"}
                   </button>
                </div>
             </form>
          </div>
        </>
      )}
    </div>
  );
}