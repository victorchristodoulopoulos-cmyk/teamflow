import React from "react";
import { CalendarDays } from "lucide-react";

export default function TournamentMatches() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">Cuadrantes y Partidos</h1>
        <p className="text-slate-400 mt-2">Configuración de grupos y eliminatorias.</p>
      </div>

      <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[40px] bg-[#162032]/30">
        <CalendarDays size={48} className="text-amber-500/40 mb-4" />
        <h3 className="text-xl font-bold text-white">Motor de Emparejamientos</h3>
        <p className="text-slate-500">Próximamente: Generación automática por IA.</p>
      </div>
    </div>
  );
}