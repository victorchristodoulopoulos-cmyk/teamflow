import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { getMyClubContext } from "../../supabase/clubService";
import { Map, Calendar, MapPin, ArrowRight } from "lucide-react";

// 🔥 IMPORTAMOS NUESTRO ESCUDO (PAYWALL)
import RequirePro from "../../components/RequirePro";

export default function ClubStages() {
  const navigate = useNavigate();
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const { club_id } = await getMyClubContext();
      const { data, error } = await supabase
        .from("club_stages")
        .select("*, stages(*)")
        .eq("club_id", club_id) 
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedStages = data.map(cs => {
          const stageReal = cs.stages;
          let finalLogo = stageReal.proveedor_logo;
          
          if (finalLogo && !finalLogo.startsWith('http')) {
            const { data: urlData } = supabase.storage.from('stage').getPublicUrl(finalLogo);
            finalLogo = urlData.publicUrl;
          }
          
          return { 
            ...stageReal, 
            id: cs.stage_id, 
            proveedor_logo: finalLogo,
            precio_total: cs.precio_total 
          };
        });
        setStages(formattedStages);
      }
    } catch (error) {
      console.error("Error cargando stages:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;

  // 🔥 ENVOLVEMOS TODO CON <RequirePro>
  return (
    <RequirePro featureName="Stages & Viajes">
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-[#162032] border border-white/5 p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4">
              <Map size={12} /> TeamFlow Experiences
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">Mis Stages</h1>
            <p className="text-slate-400 mt-3 max-w-xl text-sm leading-relaxed">Gestión de experiencias de alto rendimiento y viajes organizados.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {stages.map((stage) => (
            <div 
              key={stage.id} 
              onClick={() => navigate(`/club-dashboard/stages/${stage.id}`)} 
              className="group bg-[#162032] border border-white/5 rounded-[32px] overflow-hidden hover:border-amber-500/50 transition-all cursor-pointer shadow-lg"
            >
              <div className="h-56 overflow-hidden relative">
                <img src={stage.banner_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={stage.nombre} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#162032] to-transparent opacity-80"></div>
                
                {stage.proveedor_logo && (
                  <div className="absolute top-4 right-4 bg-white p-3 rounded-[18px] shadow-xl border border-white/10">
                    <img src={stage.proveedor_logo} alt="Organizador" className="h-12 w-auto object-contain" />
                  </div>
                )}

                <div className="absolute bottom-4 left-6 right-4">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-1 group-hover:text-amber-500 transition-colors">{stage.nombre}</h3>
                  <p className="text-slate-400 text-xs flex items-center gap-1 font-bold uppercase tracking-wider"><MapPin size={12} className="text-amber-500"/> {stage.lugar}</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed">{stage.descripcion}</p>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} className="text-amber-500"/> {stage.fecha_inicio}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-brand-deep transition-all shadow-lg">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RequirePro>
  );
}