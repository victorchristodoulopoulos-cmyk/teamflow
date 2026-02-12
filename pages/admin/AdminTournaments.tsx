import { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { Trophy, Plus, Calendar, MapPin, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // ESTADO ADAPTADO A TU TABLA: fecha y ciudad
  const [formData, setFormData] = useState({
    nombre: "",
    fecha: "",
    ciudad: "",
    estado: "activo"
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    // Cambiamos 'fecha_inicio' por 'fecha'
    const { data, error } = await supabase
      .from('torneos')
      .select('*')
      .order('fecha', { ascending: false });
    
    if (!error && data) setTournaments(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Inserción con tus nombres de columna reales
    const { error } = await supabase
      .from('torneos')
      .insert([formData]);

    if (error) {
      setStatusMsg({ type: 'error', text: "Error: " + error.message });
    } else {
      setStatusMsg({ type: 'success', text: "¡Fila añadida a Supabase!" });
      setFormData({ nombre: "", fecha: "", ciudad: "", estado: "activo" });
      setIsAdding(false);
      fetchTournaments();
    }
    setLoading(false);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const deleteTournament = async (id: string) => {
    if (!confirm("¿Borrar este torneo de la base de datos?")) return;
    const { error } = await supabase.from('torneos').delete().eq('id', id);
    if (!error) fetchTournaments();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tighter italic text-white uppercase leading-none">Gestión de Eventos</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 underline decoration-red-600 underline-offset-8">Conexión Directa Supabase</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-brand-neon hover:bg-white text-brand-deep px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(var(--brand-neon),0.2)]"
        >
          {isAdding ? "Cerrar" : <><Plus size={18}/> Crear Torneo</>}
        </button>
      </header>

      {statusMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 ${statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {statusMsg.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
          <span className="text-xs font-bold uppercase">{statusMsg.text}</span>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-[#162032]/60 border border-brand-neon/30 p-10 rounded-[40px] grid grid-cols-1 md:grid-cols-3 gap-8 shadow-2xl">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-3 ml-1 tracking-widest">Nombre del Torneo</label>
            <input 
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-brand-neon outline-none transition-all font-bold"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-3 ml-1 tracking-widest">Fecha (Column: fecha)</label>
            <input 
              type="date"
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-brand-neon outline-none transition-all color-scheme-dark"
              value={formData.fecha}
              onChange={e => setFormData({...formData, fecha: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-3 ml-1 tracking-widest">Ciudad (Column: ciudad)</label>
            <input 
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-brand-neon outline-none transition-all font-bold"
              value={formData.ciudad}
              onChange={e => setFormData({...formData, ciudad: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-neon hover:bg-white text-brand-deep h-[60px] rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Añadir Fila"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading && !isAdding ? (
          <div className="py-20 text-center animate-pulse font-black text-slate-600 tracking-widest italic">Sincronizando con Supabase...</div>
        ) : (
          tournaments.map((t) => (
            <div key={t.id} className="bg-[#162032]/20 border border-white/5 p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-[#162032]/40 transition-all">
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-orange-500 border border-white/5 group-hover:border-orange-500/50 transition-all shadow-inner">
                  <Trophy size={38} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">{t.nombre}</h3>
                  <div className="flex items-center gap-6 mt-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em]">
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-brand-neon"/> {t.fecha}</span>
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-brand-neon"/> {t.ciudad}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10 w-full md:w-auto justify-between border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                 <div className="text-right">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Status</p>
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${t.estado === 'activo' ? 'border-brand-neon text-brand-neon bg-brand-neon/10' : 'border-slate-700 text-slate-500'}`}>
                      {t.estado || 'N/A'}
                    </span>
                 </div>
                 <button onClick={() => deleteTournament(t.id)} className="p-4 rounded-2xl bg-white/5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all">
                   <Trash2 size={20} />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}