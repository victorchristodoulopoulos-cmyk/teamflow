import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { useFamily } from "../../context/FamilyContext";
import { 
  Map, Calendar, MapPin, ChevronLeft, 
  Activity, Building, CreditCard, Clock, Plane, Info, CheckCircle2, ShieldAlert
} from "lucide-react";

export default function FamilyStageDetail() {
  const { stageId } = useParams();
  const navigate = useNavigate();
  const { activeChildId, players, globalData } = useFamily();
  
  const [stage, setStage] = useState<any>(null);
  const [actividades, setActividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado financiero resumen
  const [financeSummary, setFinanceSummary] = useState({ total: 0, paid: 0, pending: 0 });

  useEffect(() => {
    const targetPlayerId = activeChildId || (players.length > 0 ? players[0].id : null);
    if (stageId && targetPlayerId) {
      fetchStageData(targetPlayerId);
      calculateFinances(targetPlayerId);
    }
  }, [stageId, activeChildId, players]);

  const fetchStageData = async (playerId: string) => {
    try {
      // 1. Obtener la inscripción para saber el club
      const { data: inscData } = await supabase
        .from("stage_inscripciones")
        .select("club_id")
        .eq("stage_id", stageId)
        .eq("player_id", playerId)
        .single();

      if (!inscData) {
        setLoading(false);
        return;
      }

      // 2. Obtener el stage general + la configuración del club
      const { data: csData } = await supabase
        .from("club_stages")
        .select("*, stages(*)")
        .eq("stage_id", stageId)
        .eq("club_id", inscData.club_id)
        .single();

      if (csData && csData.stages) {
        let finalLogo = csData.stages.proveedor_logo;
        if (finalLogo && !finalLogo.startsWith('http')) {
          finalLogo = supabase.storage.from('stage').getPublicUrl(finalLogo).data.publicUrl;
        }
        setStage({ 
          ...csData.stages, 
          proveedor_logo: finalLogo,
          precio_total: csData.precio_total 
        });
      }

      // 3. Obtener el Itinerario
      const { data: actData } = await supabase
        .from("actividades_stage")
        .select("*")
        .eq("stage_id", stageId)
        .order("dia_numero", { ascending: true })
        .order("hora_inicio", { ascending: true });
        
      if (actData) {
        const grouped = Object.values(actData.reduce((acc: any, curr: any) => {
          if (!acc[curr.dia_numero]) acc[curr.dia_numero] = { dia_numero: curr.dia_numero, actividades: [] };
          acc[curr.dia_numero].actividades.push(curr);
          return acc;
        }, {}));
        setActividades(grouped);
      }
    } catch (error) {
      console.error("Error loading stage details:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinances = (playerId: string) => {
    const childData = globalData[playerId];
    if (!childData) return;

    const pagosStage = (childData.payments || []).filter((p: any) => p.stage_id === stageId);
    let paid = 0;
    let pending = 0;

    pagosStage.forEach((p: any) => {
      if (p.estado === 'pagado') paid += p.importe;
      else pending += p.importe;
    });

    setFinanceSummary({ total: paid + pending, paid, pending });
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!stage) return <div className="text-center p-20 text-white">Información del viaje no encontrada.</div>;

  const targetPlayerName = activeChildId ? players.find(p => p.id === activeChildId)?.name : players[0]?.name;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300 pb-20 max-w-[1200px] mx-auto">
      
      {/* 🚀 HERO HEADER */}
      <div className="relative h-[300px] md:h-[400px] rounded-[32px] md:rounded-[40px] overflow-hidden group shadow-2xl">
        <img src={stage.banner_url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent"></div>
        
        <div className="relative z-10 flex justify-between items-start p-6 md:p-8 w-full">
          <button onClick={() => navigate('/family-dashboard/stages')} className="bg-black/40 backdrop-blur-md border border-white/10 text-white px-4 md:px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2">
            <ChevronLeft size={16} /> Volver
          </button>
          {stage.proveedor_logo && (
            <div className="bg-white p-3 rounded-2xl shadow-2xl border border-white/20">
              <img src={stage.proveedor_logo} alt="Proveedor" className="h-8 md:h-12 w-auto object-contain" />
            </div>
          )}
        </div>

        <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-500 text-[10px] font-black uppercase tracking-widest mb-3 backdrop-blur-md">
            <Plane size={12} /> Viaje Confirmado
          </div>
          <h1 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-3">{stage.nombre}</h1>
          <div className="flex flex-wrap gap-4 md:gap-6 text-slate-300 text-xs md:text-sm font-bold">
            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-amber-500"/> {stage.fecha_inicio} al {stage.fecha_fin}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-amber-500"/> {stage.lugar}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: INFO Y FINANZAS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* TARJETA FINANCIERA INTELIGENTE */}
          <div className="bg-gradient-to-br from-[#162032] to-[#0D1B2A] border border-white/5 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px]"></div>
             <h3 className="text-lg font-black text-white italic uppercase mb-1 flex items-center gap-2 relative z-10">
               <CreditCard className="text-amber-500" size={18}/> Pagos del Viaje
             </h3>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 relative z-10">Resumen de {targetPlayerName}</p>
             
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-sm font-bold text-slate-400">Total del Stage</span>
                  <span className="text-xl font-black text-white">{stage.precio_total}€</span>
                </div>
                
                {financeSummary.pending > 0 ? (
                  <div className="flex justify-between items-center bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl">
                    <span className="text-xs font-black uppercase text-orange-500 flex items-center gap-2"><Clock size={14}/> Pendiente</span>
                    <span className="text-lg font-black text-orange-500">{financeSummary.pending}€</span>
                  </div>
                ) : financeSummary.paid > 0 ? (
                  <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    <span className="text-xs font-black uppercase text-emerald-500 flex items-center gap-2"><CheckCircle2 size={14}/> Pagado</span>
                    <span className="text-lg font-black text-emerald-500">{financeSummary.paid}€</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-xl">
                    <span className="text-xs font-bold text-slate-400">Estado</span>
                    <span className="text-xs font-black uppercase text-slate-300 tracking-widest">Sin generar</span>
                  </div>
                )}
             </div>

             <button 
               onClick={() => navigate('/family-dashboard/pagos')}
               className="w-full mt-6 py-4 rounded-xl bg-amber-500 text-brand-deep font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
             >
               Ir a Pagos para gestionar
             </button>
          </div>

          {/* INFORMACIÓN GENERAL */}
          <div className="bg-[#162032] border border-white/5 rounded-[32px] p-6 shadow-xl">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={16} className="text-amber-500"/> Detalles
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">{stage.descripcion}</p>
            
            {/* Mockup Alojamiento (Informativo) */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-start gap-4">
              <Building className="text-slate-500 shrink-0" size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Alojamiento</p>
                <p className="text-sm font-bold text-white">Hotel / Residencia Oficial</p>
                <p className="text-xs text-slate-400 mt-1">El club enviará el Rooming (asignación de habitaciones) unos días antes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: ITINERARIO */}
        <div className="lg:col-span-2">
          <div className="bg-[#162032] border border-white/5 rounded-[32px] p-6 md:p-8 shadow-xl">
            <h3 className="text-2xl font-black text-white italic uppercase mb-6 flex items-center gap-2">
              <Map className="text-amber-500" size={24}/> Itinerario Oficial
            </h3>

            {actividades.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <Calendar size={40} className="mx-auto mb-3 text-slate-500" />
                <p className="text-sm font-bold text-white">Itinerario en construcción</p>
                <p className="text-xs text-slate-400 mt-1">El club publicará pronto la agenda de actividades.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {actividades.map((dia: any) => (
                  <div key={dia.dia_numero} className="relative">
                    <h4 className="text-lg font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-3">
                      <span className="bg-amber-500/20 px-3 py-1 rounded-lg">DÍA {dia.dia_numero}</span>
                    </h4>
                    <div className="space-y-4 pl-4 border-l-2 border-white/10 ml-4">
                      {dia.actividades.map((act: any) => (
                        <div key={act.id} className="relative pl-6">
                          <div className="absolute -left-[29px] top-1.5 w-3 h-3 bg-[#162032] border-2 border-amber-500 rounded-full"></div>
                          <div className="bg-[#0D1B2A] border border-white/5 p-4 rounded-2xl hover:border-amber-500/30 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-bold text-white uppercase text-sm">{act.titulo}</h5>
                              <span className="text-xs font-black font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                                {act.hora_inicio}
                              </span>
                            </div>
                            {act.descripcion && <p className="text-xs text-slate-400 mt-2">{act.descripcion}</p>}
                            {act.ubicacion && (
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-3 flex items-center gap-1.5">
                                <MapPin size={12}/> {act.ubicacion}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}