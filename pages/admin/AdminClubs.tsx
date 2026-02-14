import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Añadido para navegar al detalle
import { supabase } from "../../supabase/supabaseClient";
import { 
  Shield, Plus, Trash2, Loader2, Search, ExternalLink, 
  Filter, MoreVertical, X, Upload, CheckCircle, AlertCircle,
  Database, Activity, Globe, Edit3, ChevronRight 
} from "lucide-react";

// --- HELPERS ---
const getClubLogoUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('club-logos').getPublicUrl(path);
  return data.publicUrl;
};

export default function AdminClubs() {
  const navigate = useNavigate(); // Inicializamos navigate
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado para el Modal / SidePanel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Campos del formulario
  const [formData, setFormData] = useState({
    name: "",
    logo_path: ""
  });

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clubs')
      .select(`
        *,
        torneo_jugadores(count)
      `)
      .order('created_at', { ascending: false });
      
    if (!error && data) setClubs(data);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingClub(null);
    setFormData({ name: "", logo_path: "" });
    setIsPanelOpen(true);
  };

  const openEdit = (club: any) => {
    setEditingClub(club);
    setFormData({ name: club.name, logo_path: club.logo_path || "" });
    setIsPanelOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setFormLoading(true);
    const { error: uploadError } = await supabase.storage
      .from('club-logos')
      .upload(filePath, file);

    if (uploadError) {
      alert("Error subiendo imagen");
    } else {
      setFormData({ ...formData, logo_path: filePath });
    }
    setFormLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = {
      name: formData.name.trim(),
      logo_path: formData.logo_path
    };

    let error;
    if (editingClub) {
      const { error: err } = await supabase.from('clubs').update(payload).eq('id', editingClub.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('clubs').insert([payload]);
      error = err;
    }

    if (error) {
      setStatusMsg({ type: 'error', text: error.message });
    } else {
      setStatusMsg({ type: 'success', text: editingClub ? "Club actualizado" : "Club creado con éxito" });
      setTimeout(() => {
        setIsPanelOpen(false);
        fetchClubs();
        setStatusMsg(null);
      }, 1000);
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este club permanentemente?")) return;
    const { error } = await supabase.from('clubs').delete().eq('id', id);
    if (!error) fetchClubs();
  };

  const filteredClubs = clubs.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER DINÁMICO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-10 lg:pt-0">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 rounded-2xl bg-brand-neon/10 border border-brand-neon/20">
                <Database size={24} className="text-brand-neon" />
             </div>
             <h1 className="text-5xl font-display font-black tracking-tighter italic text-white uppercase leading-none">Directorio de Clubes</h1>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand-neon animate-pulse"></span>
            Gestión centralizada de clubes asociados
          </p>
        </div>
        <button 
          onClick={openCreate}
          className="bg-brand-neon hover:bg-white text-black px-8 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-brand-neon/10 hover:scale-105"
        >
          <Plus size={20} /> Registrar Club
        </button>
      </header>

      {/* BARRA DE BÚSQUEDA PRO */}
      <div className="bg-[#162032]/40 border border-white/5 p-4 rounded-[32px] flex items-center gap-4">
        <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-neon transition-colors" size={18} />
            <input 
                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-16 pr-6 py-5 text-white outline-none focus:border-brand-neon/30 transition-all font-bold text-sm tracking-wide"
                placeholder="Buscar por nombre o ID del club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="hidden md:flex items-center gap-2 px-6 border-l border-white/5">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Clubes:</span>
            <span className="text-sm font-black text-brand-neon">{clubs.length}</span>
        </div>
      </div>

      {/* GRID DE CLUBES MEJORADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
            Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-[320px] rounded-[48px] bg-white/5 animate-pulse border border-white/5"></div>
            ))
        ) : (
            filteredClubs.map(club => (
                <div key={club.id} className="group relative bg-[#162032]/20 border border-white/5 p-10 rounded-[50px] hover:bg-[#162032]/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-neon/5 rounded-full blur-[80px] group-hover:bg-brand-neon/10 transition-colors"></div>

                    <div className="flex items-start justify-between mb-10 relative z-10">
                        <div className="w-20 h-20 rounded-[28px] bg-black/60 border border-white/5 flex items-center justify-center p-4 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                            {club.logo_path ? (
                                <img src={getClubLogoUrl(club.logo_path)} className="w-full h-full object-contain" alt="Logo" />
                            ) : (
                                <Shield size={36} className="text-slate-700 group-hover:text-brand-neon transition-colors" />
                            )}
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => openEdit(club)} className="p-3 rounded-xl bg-white/5 text-slate-500 hover:text-brand-neon transition-all hover:bg-white/10">
                                <Edit3 size={18} />
                             </button>
                             <button onClick={() => handleDelete(club.id)} className="p-3 rounded-xl bg-white/5 text-slate-500 hover:text-red-500 transition-all hover:bg-red-500/10">
                                <Trash2 size={18} />
                             </button>
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <h3 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-brand-neon transition-colors">
                            {club.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <Globe size={12} className="text-slate-600" />
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">ID: {club.id.split('-')[0]}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-10 border-t border-white/5 pt-10 relative z-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={10} className="text-brand-neon" /> Inscripciones
                            </p>
                            <p className="text-2xl font-display font-black text-white tracking-tighter italic">
                                {club.torneo_jugadores?.[0]?.count || 0}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registrado el</p>
                            <p className="text-lg font-bold text-white tracking-tighter italic">
                                {new Date(club.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 relative z-10">
                        {/* 👇 Aquí está el link al nuevo dashboard */}
                        <button 
                          onClick={() => navigate(`/admin/clubs/${club.id}`)}
                          className="w-full flex items-center justify-center gap-3 py-5 rounded-[24px] bg-white/5 text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-brand-neon hover:text-black transition-all group/btn border border-white/5"
                        >
                            DETALLES DEL CLUB <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            ))
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
                     {editingClub ? "Editar Club" : "Nuevo Club"}
                   </h2>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Consola de administración</p>
                </div>
                <button onClick={() => setIsPanelOpen(false)} className="p-4 rounded-2xl bg-white/5 text-slate-500 hover:text-white">
                   <X size={24} />
                </button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-10">
                {statusMsg && (
                    <div className={`p-5 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4 ${statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {statusMsg.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                        <span className="text-xs font-black uppercase tracking-widest">{statusMsg.text}</span>
                    </div>
                )}

                <div className="space-y-4">
                   <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Nombre Oficial del Club</label>
                   <input 
                     required
                     className="w-full bg-black/40 border border-white/10 rounded-[24px] px-8 py-6 text-white focus:border-brand-neon outline-none transition-all font-bold text-lg shadow-inner"
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     placeholder="Ej: Elite Academy FC"
                   />
                </div>

                <div className="space-y-4">
                   <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 italic">Logotipo (Cloud Storage)</label>
                   <div className="flex items-center gap-8">
                      <div className="w-28 h-28 rounded-3xl bg-black/60 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                         {formData.logo_path ? (
                            <img src={getClubLogoUrl(formData.logo_path)} className="w-full h-full object-contain p-4" alt="Preview" />
                         ) : (
                            <Shield size={32} className="text-slate-800" />
                         )}
                      </div>
                      <div className="flex-1">
                        <label className="group flex items-center justify-center gap-3 w-full py-6 rounded-[24px] bg-white/5 border border-white/5 hover:border-brand-neon transition-all cursor-pointer">
                            {formLoading ? <Loader2 className="animate-spin text-brand-neon" /> : <><Upload size={18} className="text-slate-500 group-hover:text-brand-neon" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Subir Imagen</span></>}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                        <p className="text-[9px] text-slate-600 mt-4 uppercase font-bold tracking-tighter">JPG, PNG o SVG • Máx 2MB</p>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-white/5">
                   <button 
                     type="submit" 
                     disabled={formLoading}
                     className="w-full bg-brand-neon hover:bg-white text-black h-20 rounded-[30px] font-black uppercase text-sm tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand-neon/20 active:scale-95"
                   >
                     {formLoading ? <Loader2 className="animate-spin" /> : editingClub ? "Actualizar Club" : "Confirmar Alta"}
                   </button>
                </div>
             </form>
          </div>
        </>
      )}
    </div>
  );
}