import React, { useEffect, useState } from "react";
import { getClubPlayers, createPlayer, getMyClubContext, JugadorRow } from "../../supabase/clubService";
import { UserPlus, User, Search, Filter, ShieldCheck, Mail, Clock } from "lucide-react";

export default function ClubPlayers() {
  const [players, setPlayers] = useState<JugadorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { loadPlayers(); }, []);

  const loadPlayers = async () => {
    try {
      const { club_id } = await getMyClubContext();
      const data = await getClubPlayers(club_id);
      setPlayers(data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const filteredPlayers = players.filter(p => 
    `${p.name} ${p.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-brand-neon animate-pulse font-mono uppercase">Cargando base de datos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER OPERATIVO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-display font-black text-white italic uppercase tracking-tighter">Plantilla Total</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Base de datos maestra de jugadores del club</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-3.5 text-slate-600" size={18} />
            <input 
              type="text" 
              placeholder="BUSCAR JUGADOR..."
              className="w-full bg-[#162032] border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white text-xs font-bold tracking-widest outline-none focus:border-brand-neon transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-4 bg-brand-neon text-brand-deep rounded-2xl hover:scale-105 transition-all">
            <UserPlus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="p-6 rounded-[24px] bg-[#162032]/40 border border-white/5">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total</p>
            <span className="text-3xl font-display font-black text-white tracking-tighter">{players.length}</span>
         </div>
         <div className="p-6 rounded-[24px] bg-[#162032]/40 border border-white/5">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Activos</p>
            <span className="text-3xl font-display font-black text-brand-neon tracking-tighter">{players.length}</span>
         </div>
      </div>

      {/* TABLA DE JUGADORES */}
      <div className="bg-[#162032]/40 border border-white/5 rounded-[32px] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0D1B2A] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <tr>
              <th className="px-8 py-6">Jugador</th>
              <th className="px-8 py-6">DNI / Pasaporte</th>
              <th className="px-8 py-6">Nacimiento</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredPlayers.map(p => (
              <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-brand-neon italic uppercase">
                         {p.name.charAt(0)}{p.surname?.charAt(0)}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-white uppercase">{p.name} {p.surname}</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Canterano</p>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-6 font-mono text-xs text-slate-400">
                   {p.dni || "PENDIENTE"}
                </td>
                <td className="px-8 py-6 text-xs text-slate-400 font-bold">
                   {p.birth_date ? new Date(p.birth_date).toLocaleDateString() : "---"}
                </td>
                <td className="px-8 py-6 text-right">
                   <button className="px-4 py-2 rounded-lg bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-brand-neon hover:text-brand-deep transition-all">
                      Ficha
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}