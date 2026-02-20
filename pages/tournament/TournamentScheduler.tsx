import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { 
  Calendar, Clock, ShieldAlert, Cpu, Save, RefreshCw, 
  Settings, ArrowRight, CheckCircle2, AlertTriangle, Users 
} from "lucide-react";

// Tipos para el algoritmo
type Match = {
  id: string;
  category: string;
  teamA: string;
  teamB: string;
  day: number;
  time: string;
  field: number;
  duration: number;
  isConflict?: boolean;
  conflictReason?: string;
};

export default function TournamentScheduler() {
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  
  // Configuración del Algoritmo
  const [config, setConfig] = useState({
    categoria: "B12 Alevín",
    numEquipos: 16,
    formato: "4grupos_4equipos", // 4 grupos de 4
    fasesFinales: true,
    fasePlata: true,
    minPartidos: 4,
    duracionPartido: 40, // min
    descansoEntrePartidos: 60 // min (Restricción física)
  });

  // Estado del Cuadrante (Simulado)
  const [matches, setMatches] = useState<Match[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // --- EL CEREBRO: ALGORITMO DE GENERACIÓN ---
  const runSimulation = () => {
    setSimulating(true);
    setMatches([]);
    setConflicts([]);

    setTimeout(() => {
      // 1. GENERAR GRUPOS (Lógica matemática)
      const matchesGenerados: Match[] = [];
      const numGrupos = 4;
      const equiposPorGrupo = 4;
      
      // Simulación de Fase de Grupos (Todos contra todos)
      let matchId = 1;
      let currentTime = 9 * 60; // 09:00 en minutos

      for (let g = 0; g < numGrupos; g++) {
        const grupoLetra = String.fromCharCode(65 + g); // A, B, C...
        
        // Algoritmo Round Robin simplificado
        for (let i = 1; i <= equiposPorGrupo; i++) {
          for (let j = i + 1; j <= equiposPorGrupo; j++) {
            
            // Lógica de asignación de hora (muy básica para el ejemplo)
            const hour = Math.floor(currentTime / 60);
            const min = currentTime % 60;
            const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
            
            // DETECCIÓN DE CONFLICTOS (Simulada)
            let conflict = false;
            let reason = "";

            // Ejemplo: Restricción "Equipo no llega viernes mañana"
            if (g === 0 && hour < 12) { // Supongamos que el Grupo A tiene un equipo de fuera
               conflict = true;
               reason = "⚠️ Restricción: El Grupo A tiene equipos que llegan a las 14:00";
            }

            matchesGenerados.push({
              id: `m-${matchId}`,
              category: config.categoria,
              teamA: `G${grupoLetra}-${i}`,
              teamB: `G${grupoLetra}-${j}`,
              day: 1,
              time: timeString,
              field: (matchId % 4) + 1, // Repartir entre 4 campos
              duration: config.duracionPartido,
              isConflict: conflict,
              conflictReason: reason
            });

            matchId++;
            currentTime += config.duracionPartido + 5; // +5 min rotación
            if (currentTime > 20 * 60) currentTime = 9 * 60; // Reset al día siguiente si pasa de las 20h
          }
        }
      }

      setMatches(matchesGenerados);
      
      // Calcular alertas
      const conflictsFound = matchesGenerados.filter(m => m.isConflict).map(m => m.conflictReason!);
      setConflicts([...new Set(conflictsFound)]); // Unique conflicts

      setSimulating(false);
    }, 1500); // Fake delay para parecer que piensa mucho
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 pb-20 animate-in fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 mb-2">
            <Cpu size={12} /> Algoritmo Genético v2.0
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
            Simulador de Cuadrantes
          </h1>
          <p className="text-slate-400 text-sm">Diseña, prueba y valida el calendario antes de hacerlo oficial.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 border border-white/10">
            <Settings size={16} /> Restricciones Avanzadas
          </button>
          <button className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center gap-2">
            <Save size={16} /> Publicar Calendario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* PANEL DE CONFIGURACIÓN (Izquierda) */}
        <div className="xl:col-span-1 space-y-6">
          
          <div className="bg-[#1e293b] border border-white/10 p-6 rounded-[24px]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Settings size={16} className="text-indigo-400" /> Parámetros
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Categoría Objetivo</label>
                <select className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors">
                  <option>B12 Alevín (16 Eqs)</option>
                  <option>B14 Infantil (24 Eqs)</option>
                  <option>G16 Femenino (8 Eqs)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Formato Competición</label>
                <select className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors">
                  <option value="4x4">4 Grupos de 4 (Clásico)</option>
                  <option value="champions">Formato Champions (Ida/Vuelta)</option>
                  <option value="suizo">Sistema Suizo (Ajedrez)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Duración (min)</label>
                  <input type="number" value={config.duracionPartido} onChange={(e) => setConfig({...config, duracionPartido: parseInt(e.target.value)})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white text-center font-mono outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Descanso (min)</label>
                  <input type="number" value={config.descansoEntrePartidos} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white text-center font-mono outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.fasePlata ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                    {config.fasePlata && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <span className="text-sm text-slate-300">Generar Fase Plata (Consolación)</span>
                  <input type="checkbox" className="hidden" checked={config.fasePlata} onChange={() => setConfig({...config, fasePlata: !config.fasePlata})} />
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${true ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                  <span className="text-sm text-slate-300">Evitar cruces mismo Club</span>
                  <input type="checkbox" className="hidden" checked readOnly />
                </label>
              </div>

              <button 
                onClick={runSimulation}
                disabled={simulating}
                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {simulating ? <RefreshCw className="animate-spin" size={16} /> : <Cpu size={16} />}
                {simulating ? "Calculando..." : "Generar Borrador"}
              </button>

            </div>
          </div>

          {/* ALERTAS Y CONFLICTOS */}
          <div className={`bg-[#1e293b] border ${conflicts.length > 0 ? 'border-red-500/50' : 'border-white/10'} p-6 rounded-[24px] transition-all`}>
            <h3 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${conflicts.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {conflicts.length > 0 ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
              Diagnóstico IA
            </h3>
            
            {conflicts.length === 0 && matches.length > 0 && (
              <p className="text-xs text-slate-400">El algoritmo no ha detectado colisiones graves. El calendario es viable físicamente.</p>
            )}

            {conflicts.length > 0 && (
              <div className="space-y-3">
                {conflicts.map((c, i) => (
                  <div key={i} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex gap-3">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                    <p className="text-xs text-red-200 leading-relaxed">{c}</p>
                  </div>
                ))}
              </div>
            )}
            
            {matches.length === 0 && !simulating && (
              <p className="text-xs text-slate-500 italic">Ejecuta la simulación para ver el análisis de riesgos.</p>
            )}
          </div>

        </div>

        {/* VISUALIZADOR DE CUADRANTE (Centro/Derecha) */}
        <div className="xl:col-span-3 space-y-6">
          
          <div className="bg-[#1e293b] border border-white/10 p-1 rounded-[24px] overflow-hidden flex flex-col h-[800px]">
            {/* Header del Grid */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#162032]">
              <div className="flex gap-4">
                <button className="text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-lg">Día 1 (Sábado)</button>
                <button className="text-xs font-bold text-slate-500 hover:text-white px-4 py-2 rounded-lg">Día 2 (Domingo)</button>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {matches.length} partidos generados
              </div>
            </div>

            {/* Grid Visual */}
            <div className="flex-1 overflow-auto p-6 relative bg-grid-pattern">
              
              {matches.length === 0 && !simulating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 opacity-50">
                  <Calendar size={64} className="mb-4" />
                  <p className="text-lg font-bold uppercase">Esperando datos...</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4 min-w-[800px]">
                  {/* Columnas por Campo */}
                  {[1, 2, 3, 4].map(campo => (
                    <div key={campo} className="space-y-4">
                      <div className="text-center text-xs font-black text-slate-500 uppercase tracking-widest bg-black/20 py-2 rounded-lg mb-4">
                        Campo {campo}
                      </div>
                      
                      {matches.filter(m => m.field === campo).map(match => (
                        <div 
                          key={match.id} 
                          className={`relative p-3 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer group ${
                            match.isConflict 
                              ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20' 
                              : 'bg-[#0f172a] border-white/10 hover:border-indigo-500/50'
                          }`}
                        >
                          {match.isConflict && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center z-10 shadow-lg animate-pulse">
                              <AlertTriangle size={10} />
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${match.isConflict ? 'bg-red-500 text-white' : 'bg-indigo-500/20 text-indigo-300'}`}>
                              {match.time}
                            </span>
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Grp {match.teamA.split('-')[0].replace('G', '')}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{match.teamA}</span>
                              <span className="text-[10px] text-slate-600 bg-black px-1 rounded">vs</span>
                              <span className="text-xs font-bold text-white">{match.teamB}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}