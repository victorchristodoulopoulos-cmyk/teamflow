import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Map, Plus, Building2, Clock, ChevronRight } from "lucide-react";

export default function TournamentSedes() {
  const navigate = useNavigate();
  const [sedes, setSedes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [torneoId, setTorneoId] = useState<string | null>(null);

  useEffect(() => {
    fetchSedes();
  }, []);

  const fetchSedes = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from("profiles").select("torneo_id").eq("id", user.id).single();

    if (profile?.torneo_id) {
      setTorneoId(profile.torneo_id);
      const { data } = await supabase.from("sedes_torneo").select("*").eq("torneo_id", profile.torneo_id).order('created_at');
      if (data) setSedes(data);
    }
    setLoading(false);
  };

  const handleCreateSede = async () => {
    if (!torneoId) return;
    const name = prompt("Nombre de la nueva sede (Ej: Estadio Municipal):");
    if (!name) return;

    const { data, error } = await supabase
      .from("sedes_torneo")
      .insert([{ torneo_id: torneoId, nombre: name }])
      .select();

    if (!error && data) {
      navigate(`/tournament-dashboard/sedes/${data[0].id}`);
    } else {
      alert("Error al crear la sede.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      <div className="bg-[#162032] border border-white/5 p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden flex justify-between items-end">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20 mb-4">
            <Map size={12} /> Instalaciones Deportivas
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
            Sedes y Campos
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl text-sm leading-relaxed">
            Gestiona los pabellones, horarios y calcula la viabilidad de los partidos con nuestra IA logística.
          </p>
        </div>
        <button onClick={handleCreateSede} className="relative z-10 bg-purple-500 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-purple-400 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          <Plus size={16} /> Crear Sede
        </button>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : sedes.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px] bg-[#162032]/20">
          <Map className="mx-auto text-slate-600 mb-4" size={40} />
          <p className="text-white font-bold text-lg">No hay sedes configuradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sedes.map(sede => (
            <div key={sede.id} onClick={() => navigate(`/tournament-dashboard/sedes/${sede.id}`)} className="bg-[#162032]/80 border border-white/5 p-6 rounded-[32px] cursor-pointer hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.1)] transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center"><Building2 size={24} /></div>
                <ChevronRight className="text-slate-600 group-hover:text-purple-400 transition-colors" size={24} />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{sede.nombre}</h3>
              
              <div className="flex items-center gap-4 text-sm font-bold">
                <div className="bg-black/30 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2 text-slate-300">
                  <Map size={16} className="text-purple-400" /> {sede.campos_disponibles} Campos
                </div>
                <div className="bg-black/30 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2 text-slate-300">
                  <Clock size={16} className="text-purple-400" /> {sede.hora_inicio.slice(0,5)} - {sede.hora_fin.slice(0,5)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}