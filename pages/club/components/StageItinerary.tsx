import React from "react";
import { Clock, MapPin, Bus, Utensils, Dumbbell, Trophy, Sunset } from "lucide-react";

const getIcon = (tipo: string) => {
  switch (tipo) {
    case 'entreno': return <Dumbbell size={18} />;
    case 'partido': return <Trophy size={18} />;
    case 'comida': return <Utensils size={18} />;
    case 'viaje': return <Bus size={18} />;
    case 'ocio': return <Sunset size={18} />;
    default: return <Clock size={18} />;
  }
};

const getColor = (tipo: string) => {
  switch (tipo) {
    case 'entreno': return "bg-blue-500 text-white border-blue-400 shadow-blue-500/20";
    case 'partido': return "bg-amber-500 text-brand-deep border-amber-400 shadow-amber-500/20";
    case 'comida': return "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20";
    case 'viaje': return "bg-slate-600 text-white border-slate-500 shadow-slate-500/20";
    case 'ocio': return "bg-purple-500 text-white border-purple-400 shadow-purple-500/20";
    default: return "bg-slate-700 text-white border-slate-600";
  }
};

export default function StageItinerary({ dias }: { dias: any[] }) {
  return (
    <div className="space-y-12 pb-12">
      {dias.map((dia, idx) => (
        <div key={idx} className="relative animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
          {/* HEADER DEL DÍA */}
          <div className="flex items-center gap-4 mb-6 sticky top-0 bg-[#0f172a]/95 backdrop-blur-md py-4 z-10 border-b border-white/5">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex flex-col items-center justify-center border border-white/10">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Día</span>
              <span className="text-xl font-black text-white">{dia.dia_numero}</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Agenda del Día</h3>
              <p className="text-slate-400 text-sm">Actividades programadas</p>
            </div>
          </div>

          {/* LÍNEA DE TIEMPO */}
          <div className="ml-6 border-l-2 border-dashed border-white/10 space-y-8 pb-8 relative">
            {dia.actividades.map((act: any, aIdx: number) => (
              <div key={act.id} className="relative pl-8 group">
                
                {/* BOLITA CRONOLÓGICA */}
                <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-2 ${getColor(act.tipo).split(" ")[2]} bg-[#0f172a] z-10 group-hover:scale-125 transition-transform shadow-[0_0_15px_currentColor]`}></div>

                {/* TARJETA DE ACTIVIDAD */}
                <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all shadow-lg flex flex-col sm:flex-row gap-4 sm:items-center justify-between group-hover:translate-x-2 duration-300">
                  
                  <div className="flex items-start gap-4">
                    {/* HORA & ICONO */}
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg border-t border-white/20 ${getColor(act.tipo)}`}>
                      {getIcon(act.tipo)}
                      <span className="text-[10px] font-bold mt-1">{act.hora_inicio?.substring(0, 5)}</span>
                    </div>

                    {/* INFO */}
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{act.titulo}</h4>
                      {act.subtitulo && <p className="text-slate-400 text-sm leading-snug">{act.subtitulo}</p>}
                      
                      {/* CHIPS DE UBICACIÓN */}
                      {act.ubicacion && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-black/30 border border-white/5 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                          <MapPin size={10} /> {act.ubicacion}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOTONES DE ACCIÓN (Si aplica) */}
                  {act.tipo === 'partido' && (
                    <button className="px-4 py-2 bg-white/5 hover:bg-amber-500 hover:text-brand-deep text-slate-300 text-xs font-bold uppercase rounded-lg border border-white/10 transition-colors">
                      Ver Rival
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}