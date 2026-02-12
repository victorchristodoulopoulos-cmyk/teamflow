import { FormEvent, useEffect, useState } from "react";
import { createTeam, getClubTeams, getMyClubContext, EquipoRow } from "../../supabase/clubService";
import { Plus, Users, Hash } from "lucide-react";

export default function ClubTeams() {
  const [loading, setLoading] = useState(true);
  const [clubId, setClubId] = useState<string>("");
  const [teams, setTeams] = useState<EquipoRow[]>([]);
  const [nombre, setNombre] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const ctx = await getMyClubContext();
      setClubId(ctx.club_id);
      setTeams(await getClubTeams(ctx.club_id));
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !clubId) return;
    await createTeam({ club_id: clubId, nombre });
    setNombre("");
    await load();
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando equipos...</div>;

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      
      {/* COLUMNA IZQUIERDA: CREAR */}
      <div className="lg:col-span-1 p-6 rounded-2xl bg-[#162032]/60 border border-white/5 backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Plus size={18} className="text-brand-neon" /> Nuevo Equipo
        </h3>
        <p className="text-sm text-slate-400 mb-6">Añade una categoría para empezar a asignar jugadores.</p>
        
        <form onSubmit={onCreate} className="space-y-4">
            <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Nombre Categoría</label>
                <input
                    className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon/50 transition-colors placeholder:text-slate-600"
                    placeholder="Ej. Alevín A, Sub-10..."
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
            </div>
            <button 
                type="submit" 
                className="w-full py-3 rounded-xl bg-brand-neon text-[#0D1B2A] font-bold text-sm uppercase tracking-wide hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all"
            >
                Crear Equipo
            </button>
        </form>
      </div>

      {/* COLUMNA DERECHA: LISTA */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">Equipos Activos</h3>
            <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">Total: {teams.length}</span>
        </div>

        {teams.length === 0 ? (
            <div className="p-10 rounded-2xl border border-white/5 border-dashed text-center text-slate-500">
                No hay equipos creados todavía.
            </div>
        ) : (
            <div className="grid gap-3">
                {teams.map((t) => (
                    <div key={t.id} className="group flex items-center justify-between p-4 rounded-xl bg-[#162032]/40 border border-white/5 hover:border-brand-neon/30 transition-all hover:bg-[#162032]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-brand-neon/10 text-brand-neon flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{t.nombre}</h4>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                    <Hash size={10} /> {t.id.slice(0, 8)}...
                                </div>
                            </div>
                        </div>
                        <button className="text-xs text-slate-500 hover:text-white font-bold px-3 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">
                            GESTIONAR
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
}