import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { useFamily } from "../../context/FamilyContext";
import { Map as MapIcon, Calendar, MapPin, ArrowRight, Plane, Loader2, Shield } from "lucide-react";

export default function FamilyStages() {
  const navigate = useNavigate();
  const { activeChildId, globalData, players, loading: familyLoading } = useFamily();
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (familyLoading) return;
    
    // Si no hay un niño específico seleccionado, mostramos los stages del primero por defecto
    const targetPlayerId = activeChildId || (players.length > 0 ? players[0].id : null);
    
    if (targetPlayerId) {
      const fetchStages = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("stage_inscripciones")
            .select("*, stages(*), clubs(name, logo_path)")
            .eq("player_id", targetPlayerId)
            .order("created_at", { ascending: false });

          if (error) throw error;

          if (data) {
            const formatted = data.map((ins: any) => {
              const stageReal = ins.stages;
              let finalLogo = stageReal.proveedor_logo;
              if (finalLogo && !finalLogo.startsWith('http')) {
                const { data: urlData } = supabase.storage.from('stage').getPublicUrl(finalLogo);
                finalLogo = urlData.publicUrl;
              }
              return { 
                ...stageReal, 
                inscripcion_id: ins.id,
                club_name: ins.clubs?.name,
                estado_inscripcion: ins.estado,
                proveedor_logo: finalLogo 
              };
            });
            setStages(formatted);
          }
        } catch (error) {
          console.error("Error cargando stages:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStages();
    } else {
      setStages([]);
      setLoading(false);
    }
  }, [activeChildId, familyLoading, players]);

  if (familyLoading || loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  const targetPlayerName = activeChildId 
    ? players.find(p => p.id === activeChildId)?.name 
    : players[0]?.name;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6">
        <div>
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <Plane size={14} /> Stages & Experiencias
          </p>
          <h1 className="text-3xl md:text-5xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
            Viajes de {targetPlayerName || "Jugador"}
          </h1>
        </div>
      </div>

      {stages.length === 0 ? (
        <div className="text-center py-20 bg-[#162032]/40 rounded-[32px] border-2 border-dashed border-white/5">
          <Plane size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">Ningún stage activo</h3>
          <p className="text-slate-500 text-sm">Este jugador no está inscrito en ningún viaje actualmente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {stages.map((stage) => (
            <div 
              key={stage.id} 
              className="group bg-[#162032] border border-white/5 rounded-[32px] overflow-hidden hover:border-amber-500/50 transition-all shadow-lg flex flex-col"
            >
              <div className="h-56 overflow-hidden relative shrink-0">
                <img src={stage.banner_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={stage.nombre} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#162032] via-[#162032]/40 to-transparent opacity-90"></div>
                
                {stage.proveedor_logo && (
                  <div className="absolute top-4 right-4 bg-white p-2 rounded-xl shadow-xl border border-white/10">
                    <img src={stage.proveedor_logo} alt="Organizador" className="h-8 w-auto object-contain" />
                  </div>
                )}

                <div className="absolute bottom-4 left-6 right-4">
                  <div className="flex gap-2 mb-2">
                     <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest rounded border border-amber-500/20 backdrop-blur-sm">Confirmado</span>
                     <span className="px-2 py-1 bg-black/40 text-slate-300 text-[8px] font-black uppercase tracking-widest rounded border border-white/10 backdrop-blur-sm flex items-center gap-1"><Shield size={10}/> {stage.club_name}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tight leading-none group-hover:text-amber-500 transition-colors">{stage.nombre}</h3>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex flex-col gap-2 mb-6">
                   <p className="text-slate-400 text-xs flex items-center gap-2 font-bold uppercase tracking-wider"><MapPin size={14} className="text-amber-500"/> {stage.lugar}</p>
                   <p className="text-slate-400 text-xs flex items-center gap-2 font-bold uppercase tracking-wider"><Calendar size={14} className="text-amber-500"/> {stage.fecha_inicio}</p>
                </div>
                
                {/* BOTÓN MÁGICO A LOS DETALLES */}
                <button 
                  onClick={() => navigate(`/family-dashboard/stages/${stage.id}`)}
                  className="mt-auto w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 hover:text-[#0D1B2A] hover:border-amber-500 transition-all flex items-center justify-center gap-2"
                >
                  Ver Detalles del Viaje <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}