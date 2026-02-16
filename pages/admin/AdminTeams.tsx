import { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { Users2, Loader2, Trash2 } from "lucide-react";

export default function AdminTeams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      // Cruzamos 'equipos' con 'clubs' usando los IDs reales de tu captura
      const { data, error } = await supabase.from('equipos').select(`*, clubs (name)`);
      if (!error && data) setTeams(data);
      setLoading(false);
    };
    fetchTeams();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-display font-black tracking-tighter italic text-white uppercase">Gestión de Equipos</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 underline decoration-brand-neon underline-offset-8">Estructura operativa de la red</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-brand-neon" size={40} /></div>
        ) : teams.map((team) => (
          <div key={team.id} className="bg-[#162032]/40 border border-white/5 p-8 rounded-[32px] hover:border-brand-neon/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-neon border border-white/10 group-hover:scale-110 transition-transform">
                <Users2 size={24} />
              </div>
              <button className="text-slate-600 hover:text-red-500"><Trash2 size={18}/></button>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{team.clubs?.name || "Sin Club Asignado"}</p>
            <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">{team.nombre}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}