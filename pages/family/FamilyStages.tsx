import React, { useState, useEffect } from "react";
import { useFamily } from "../../context/FamilyContext";
import { supabase } from "../../supabase/supabaseClient";
import { getClubStagesForFamily, enrollPlayerInStage } from "../../supabase/familyService";
import { Map, Calendar, MapPin, CheckCircle2, ArrowRight, Loader2, Info } from "lucide-react";

export default function FamilyStages() {
  const { activeChild, activeChildId, globalData } = useFamily();
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  // Obtenemos el club del hijo activo desde el cache global del Contexto
  const clubId = activeChildId ? globalData[activeChildId]?.club?.id : null;

  useEffect(() => {
    if (activeChildId && clubId) {
      loadStages();
    } else {
      setLoading(false);
    }
  }, [activeChildId, clubId]);

  const loadStages = async () => {
    setLoading(true);
    try {
      const data = await getClubStagesForFamily(clubId!, activeChildId!);
      setStages(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (stage: any) => {
    if (!activeChildId || !clubId) return;
    
    const confirm = window.confirm(`¿Quieres inscribir a ${activeChild.name} en el stage ${stage.nombre}?`);
    if (!confirm) return;

    setEnrollingId(stage.id);
    try {
      await enrollPlayerInStage(activeChildId, stage.id, clubId);
      await loadStages(); // Recargamos para mostrar el check de "Inscrito"
    } catch (error: any) {
      alert(error.message || "Error al inscribir");
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="animate-spin text-brand-neon" size={32} />
    </div>
  );

  if (!activeChildId) return (
    <div className="text-center p-20 bg-[#162032]/40 rounded-[32px] border border-dashed border-white/10">
      <Info className="mx-auto text-slate-500 mb-4" size={48} />
      <p className="text-white font-bold">Selecciona a un hijo para ver los stages disponibles</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER CABECERA */}
      <div className="bg-[#162032] border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic">Stages & Experiencias</p>
          <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
            Stages de <del></del> <span className="text-brand-neon">{activeChild?.name}</span>
          </h1>
        </div>
      </div>

      {/* GRID DE STAGES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stages.map((stage) => (
          <div key={stage.id} className="group bg-[#162032] border border-white/5 rounded-[32px] overflow-hidden hover:border-amber-500/30 transition-all shadow-lg">
            <div className="h-48 overflow-hidden relative">
              <img src={stage.banner_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={stage.nombre} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#162032] to-transparent opacity-80"></div>
              
              {/* Logo Proveedor XL */}
              {stage.proveedor_logo && (
                <div className="absolute top-4 right-4 bg-white p-2 rounded-xl shadow-xl">
                   <img 
                      src={stage.proveedor_logo.startsWith('http') 
                        ? stage.proveedor_logo 
                        : supabase.storage.from('stage').getPublicUrl(stage.proveedor_logo).data.publicUrl
                      } 
                      className="h-10 object-contain" 
                      alt="Provider" 
                   />
                </div>
              )}

              <div className="absolute bottom-4 left-6 right-4">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-1">{stage.nombre}</h3>
                <p className="text-slate-400 text-xs flex items-center gap-1 font-bold uppercase tracking-wider">
                  <MapPin size={12} className="text-amber-500"/> {stage.lugar}
                </p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                {stage.descripcion}
              </p>
              
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} className="text-amber-500"/> Inicio
                  </span>
                  <span className="text-white font-bold text-sm">{stage.fecha_inicio}</span>
                </div>

                {stage.estaInscrito ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl font-black uppercase text-[10px] tracking-widest">
                    <CheckCircle2 size={14} /> ¡Inscrito!
                  </div>
                ) : (
                  <button 
                    onClick={() => handleEnroll(stage)}
                    disabled={enrollingId === stage.id}
                    className="bg-amber-500 text-brand-deep px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/10"
                  >
                    {enrollingId === stage.id ? <Loader2 className="animate-spin" size={14}/> : <ArrowRight size={14}/>}
                    Apuntarse Ahora
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {stages.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[32px] bg-[#162032]/20">
            <p className="text-slate-500 italic">No hay stages disponibles para este club en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}