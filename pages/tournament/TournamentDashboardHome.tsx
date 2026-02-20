import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { Users, Building2, TrendingUp, CalendarDays, Activity, ArrowUpRight, Clock, Trophy } from "lucide-react";

export default function TournamentDashboardHome() {
  const [data, setData] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [torneoName, setTorneoName] = useState<string>("Cargando...");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("torneo_id")
        .eq("id", user.id)
        .single();

      if (!profile?.torneo_id) {
        setTorneoName("Torneo no asignado");
        setLoading(false);
        return;
      }

      const { data: torneoData } = await supabase
        .from("torneos")
        .select("name")
        .eq("id", profile.torneo_id)
        .single();
        
      if (torneoData) setTorneoName(torneoData.name);

      const { data: inscripciones } = await supabase
        .from("inscripciones_torneo")
        .select("*")
        .eq("torneo_id", profile.torneo_id);

      if (inscripciones) setData(inscripciones);

      const { data: catData } = await supabase
        .from("categorias_torneo")
        .select("nombre")
        .eq("torneo_id", profile.torneo_id)
        .order("nombre");

      if (catData) {
        setCategorias(catData.map(c => c.nombre));
      }

      setLoading(false);
    };
    
    fetchData();
  }, []);

  const totalClubes = data.length;
  const totalEquipos = data.reduce((acc, curr) => {
    let cats = curr.categorias;
    if (typeof cats === 'string') {
      try { cats = JSON.parse(cats); } catch(e) { cats = []; }
    }
    return acc + (Array.isArray(cats) ? cats.length : 0);
  }, 0);
  
  const recaudacionPotencial = data.reduce((acc, curr) => acc + Number(curr.importe_inscripcion || 0), 0);
  const pendientes = data.filter(d => d.estado === 'pendiente').length;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="relative overflow-hidden rounded-[40px] border border-amber-500/20 bg-[#162032] p-12 shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4">
             <Activity size={14} className="animate-pulse" /> Estado de la Competición en Tiempo Real
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-white italic tracking-tighter leading-none mb-6 uppercase">
            {torneoName}
          </h1>
          <div className="flex gap-10">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Equipos Inscritos</p>
              <p className="text-3xl font-black text-white italic">{totalEquipos}</p>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Recaudación</p>
              <p className="text-3xl font-black text-amber-500 italic">{recaudacionPotencial.toLocaleString()}€</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Clubes" value={totalClubes} icon={Building2} color="text-blue-400" />
        <StatCard title="Total Equipos" value={totalEquipos} icon={Users} color="text-purple-400" />
        <StatCard title="Pendientes" value={pendientes} icon={Clock} color="text-orange-400" />
        <StatCard title="Ingresos" value={`${recaudacionPotencial}€`} icon={TrendingUp} color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
           <h3 className="text-xl font-black text-white italic uppercase mb-6 flex items-center justify-between">
             Solicitudes Recientes
             <ArrowUpRight className="text-amber-500" />
           </h3>
           <div className="space-y-4">
              {data.slice(0, 5).map((ins, i) => {
                let printCats = [];
                if (Array.isArray(ins.categorias)) printCats = ins.categorias;
                else if (typeof ins.categorias === 'string') {
                  try { printCats = JSON.parse(ins.categorias); } catch(e) {}
                }

                return (
                  <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white uppercase">{ins.nombre_club}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black">{printCats.join(", ")}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-[8px] font-black uppercase ${ins.estado === 'pendiente' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                      {ins.estado}
                    </div>
                  </div>
                )
              })}
              {data.length === 0 && !loading && (
                <p className="text-slate-500 text-sm italic">Aún no hay inscripciones.</p>
              )}
           </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
           <h3 className="text-xl font-black text-white italic uppercase mb-6 flex items-center gap-3">
             <Trophy className="text-amber-500" size={24} /> Equipos por Categoría
           </h3>
           
           {categorias.length === 0 ? (
             <div className="text-center p-6 bg-black/20 rounded-2xl border border-white/5">
               <p className="text-sm text-slate-400">No hay categorías configuradas.</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 gap-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                {categorias.map(cat => {
                  const count = data.filter(d => {
                    let reqCats = [];
                    if (Array.isArray(d.categorias)) reqCats = d.categorias;
                    else if (typeof d.categorias === 'string') {
                      try { reqCats = JSON.parse(d.categorias); } catch(e) {}
                    }
                    return reqCats.includes(cat);
                  }).length;

                  return (
                    <div key={cat} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex justify-between items-center hover:bg-amber-500/10 transition-colors">
                      <span className="text-amber-500 font-black text-sm">{cat}</span>
                      <span className="text-xl font-black text-white">{count}</span>
                    </div>
                  )
                })}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-[#162032] border border-white/5 p-6 rounded-[28px] hover:border-amber-500/30 transition-all">
      <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${color}`}>
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-white mt-1 italic">{value}</p>
    </div>
  );
}