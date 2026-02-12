import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { Shield, Plus, Trash2, Loader2, CheckCircle } from "lucide-react";

export default function AdminClubs() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClubName, setNewClubName] = useState("");

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    setLoading(true);
    // Usamos 'name' según tu tabla
    const { data, error } = await supabase.from('clubs').select('*').order('created_at', { ascending: false });
    if (!error && data) setClubs(data);
    setLoading(false);
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName) return;
    setLoading(true);
    // Inserción real en columna 'name'
    const { error } = await supabase.from('clubs').insert([{ name: newClubName }]);
    if (!error) {
      setNewClubName("");
      fetchClubs();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-16 lg:pt-0">
        <h1 className="text-3xl md:text-4xl font-display font-black tracking-tighter italic text-white uppercase leading-none">Gestión Clubes</h1>
        <div className="bg-brand-neon text-brand-deep px-4 py-2 rounded-full font-black text-xs uppercase">Total: {clubs.length}</div>
      </header>

      <div className="bg-[#162032]/60 border border-white/5 p-6 md:p-10 rounded-[40px]">
        <form onSubmit={handleCreateClub} className="flex flex-col md:flex-row gap-4">
          <input 
            required
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-brand-neon font-bold text-lg"
            placeholder="Nombre del Club..."
            value={newClubName}
            onChange={(e) => setNewClubName(e.target.value)}
          />
          <button type="submit" disabled={loading} className="bg-brand-neon text-brand-deep px-10 h-[68px] rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20}/> Crear Club</>}
          </button>
        </form>
      </div>

      <div className="bg-[#162032]/20 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-black/60 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
              <tr><th className="p-6">Nombre Entidad</th><th className="p-6">Fecha Alta</th><th className="p-6 text-right">Acciones</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clubs.map(club => (
                <tr key={club.id} className="hover:bg-white/5 transition-all">
                  <td className="p-6 font-bold text-white uppercase italic tracking-tight">{club.name}</td>
                  <td className="p-6 text-slate-500 text-xs font-bold">{new Date(club.created_at).toLocaleDateString()}</td>
                  <td className="p-6 text-right">
                    <button onClick={async () => { if(confirm("¿Borrar?")) { await supabase.from('clubs').delete().eq('id', club.id); fetchClubs(); } }} className="p-3 text-slate-500 hover:text-red-500"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}