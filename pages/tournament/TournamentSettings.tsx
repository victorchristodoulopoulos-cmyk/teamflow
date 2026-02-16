import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { 
  Wallet, Save, RefreshCw, Settings, Users, Shield, 
  BedDouble, Plus, Trash2, Tag, Euro
} from "lucide-react";

export default function TournamentSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [torneoId, setTorneoId] = useState<string | null>(null);

  // ESTADO GLOBAL LIMPIO (Sin hardcodear)
  const [settings, setSettings] = useState({
    fee_reserva_equipo: 0,
    cuota_sin_alojamiento: 0,
    dto_entrenador_1: 0,
    dto_entrenador_2: 0,
    dto_entrenador_extra: 0,
    precios_jugadores: [] as any[],
    precios_acompanantes: [] as any[]
  });

  useEffect(() => {
    fetchTorneoSettings();
  }, []);

  const fetchTorneoSettings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from("profiles").select("torneo_id").eq("id", user.id).single();

    if (profile?.torneo_id) {
      setTorneoId(profile.torneo_id);
      
      const { data: torneo, error } = await supabase
        .from("torneos")
        .select("fee_reserva_equipo, cuota_sin_alojamiento, dto_entrenador_1, dto_entrenador_2, dto_entrenador_extra, precios_jugadores, precios_acompanantes")
        .eq("id", profile.torneo_id)
        .single();
        
      if (torneo && !error) {
        setSettings({
          // Si en la BD es null, ponemos 0 para que el input no se vuelva loco
          fee_reserva_equipo: torneo.fee_reserva_equipo ?? 0,
          cuota_sin_alojamiento: torneo.cuota_sin_alojamiento ?? 0,
          dto_entrenador_1: torneo.dto_entrenador_1 ?? 0,
          dto_entrenador_2: torneo.dto_entrenador_2 ?? 0,
          dto_entrenador_extra: torneo.dto_entrenador_extra ?? 0,
          precios_jugadores: torneo.precios_jugadores || [],
          precios_acompanantes: torneo.precios_acompanantes || []
        });
      }
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!torneoId) return;
    setSaving(true);

    // 🔥 Añadimos .select() para forzar a Supabase a devolver lo que ha actualizado
    // Si el RLS nos bloquea, 'data' vendrá vacío.
    const { data, error } = await supabase
      .from("torneos")
      .update({
        fee_reserva_equipo: settings.fee_reserva_equipo,
        cuota_sin_alojamiento: settings.cuota_sin_alojamiento,
        dto_entrenador_1: settings.dto_entrenador_1,
        dto_entrenador_2: settings.dto_entrenador_2,
        dto_entrenador_extra: settings.dto_entrenador_extra,
        precios_jugadores: settings.precios_jugadores,
        precios_acompanantes: settings.precios_acompanantes
      })
      .eq("id", torneoId)
      .select();

    setSaving(false);

    if (error) {
      alert(`Error de base de datos: ${error.message}`);
    } else if (!data || data.length === 0) {
      alert("❌ Error de Permisos (RLS). Ejecuta el script SQL en Supabase para permitir Updates.");
    } else {
      alert("✅ ¡Arquitectura financiera guardada con éxito!");
    }
  };

  // --- FUNCIONES MATRIZ DINÁMICA ---
  const addPrecioJugador = () => {
    setSettings({
      ...settings,
      precios_jugadores: [...settings.precios_jugadores, { tipo_alojamiento: "Hotel", noches: 3, precio: 300 }]
    });
  };

  const removePrecioJugador = (index: number) => {
    const newArr = [...settings.precios_jugadores];
    newArr.splice(index, 1);
    setSettings({ ...settings, precios_jugadores: newArr });
  };

  const updatePrecioJugador = (index: number, field: string, value: any) => {
    const newArr = [...settings.precios_jugadores];
    newArr[index][field] = value;
    setSettings({ ...settings, precios_jugadores: newArr });
  };

  const addPrecioAcompa = () => {
    setSettings({
      ...settings,
      precios_acompanantes: [...settings.precios_acompanantes, { tipo_alojamiento: "Hotel", habitacion: "Doble", noches: 3, precio: 250 }]
    });
  };

  const removePrecioAcompa = (index: number) => {
    const newArr = [...settings.precios_acompanantes];
    newArr.splice(index, 1);
    setSettings({ ...settings, precios_acompanantes: newArr });
  };

  const updatePrecioAcompa = (index: number, field: string, value: any) => {
    const newArr = [...settings.precios_acompanantes];
    newArr[index][field] = value;
    setSettings({ ...settings, precios_acompanantes: newArr });
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-[#162032] border border-white/5 p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 mb-4">
              <Settings size={12} /> Motor de Cotización
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
              Configuración de Pagos
            </h1>
            <p className="text-slate-400 mt-3 max-w-xl text-sm leading-relaxed">
              Define las reglas de negocio, matrices de precios y descuentos. Estos datos alimentarán la generación automática de cobros a los clubes.
            </p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-500 text-brand-deep px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Guardando..." : "Guardar Sistema"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: REGLAS GENERALES & STAFF */}
        <div className="space-y-8">
          
          {/* REGLAS BASE */}
          <div className="bg-[#162032]/80 border border-white/5 p-8 rounded-[32px] shadow-xl">
            <h2 className="text-xl font-black text-white italic uppercase mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
              <Wallet className="text-emerald-500" /> Reglas Base
            </h2>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Paga y Señal (Por Equipo)</label>
                <div className="relative">
                  <Euro size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="number" value={settings.fee_reserva_equipo} onChange={e => setSettings({...settings, fee_reserva_equipo: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-bold outline-none focus:border-emerald-500/50" />
                </div>
                <p className="text-[9px] text-slate-500 mt-1">Importe inicial para bloquear la plaza.</p>
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Inscripción SIN alojamiento</label>
                <div className="relative">
                  <Euro size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="number" value={settings.cuota_sin_alojamiento} onChange={e => setSettings({...settings, cuota_sin_alojamiento: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-bold outline-none focus:border-emerald-500/50" />
                </div>
                <p className="text-[9px] text-slate-500 mt-1">Precio por jugador si no pernoctan.</p>
              </div>
            </div>
          </div>

          {/* DESCUENTOS STAFF */}
          <div className="bg-[#162032]/80 border border-white/5 p-8 rounded-[32px] shadow-xl">
            <h2 className="text-xl font-black text-white italic uppercase mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
              <Shield className="text-amber-500" /> Bonificaciones Staff
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                <span className="text-sm font-bold text-slate-300">1º Entrenador</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={settings.dto_entrenador_1} onChange={e => setSettings({...settings, dto_entrenador_1: Number(e.target.value)})} className="w-16 bg-black/60 border border-white/10 rounded-lg py-1 px-2 text-center text-amber-500 font-black outline-none" />
                  <span className="text-xs text-slate-500">% Dto.</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                <span className="text-sm font-bold text-slate-300">2º Entrenador</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={settings.dto_entrenador_2} onChange={e => setSettings({...settings, dto_entrenador_2: Number(e.target.value)})} className="w-16 bg-black/60 border border-white/10 rounded-lg py-1 px-2 text-center text-amber-500 font-black outline-none" />
                  <span className="text-xs text-slate-500">% Dto.</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                <span className="text-sm font-bold text-slate-300">Resto Staff</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={settings.dto_entrenador_extra} onChange={e => setSettings({...settings, dto_entrenador_extra: Number(e.target.value)})} className="w-16 bg-black/60 border border-white/10 rounded-lg py-1 px-2 text-center text-amber-500 font-black outline-none" />
                  <span className="text-xs text-slate-500">% Dto.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA CENTRAL Y DERECHA: MATRICES DE PRECIO */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* MATRIZ JUGADORES */}
          <div className="bg-[#162032]/80 border border-white/5 p-8 rounded-[32px] shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-white/5 pb-4 gap-4">
              <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-3">
                <Users className="text-blue-400" /> Matriz Jugadores
              </h2>
              <button onClick={addPrecioJugador} className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                <Plus size={14} /> Añadir Fila
              </button>
            </div>
            
            {settings.precios_jugadores.length === 0 ? (
              <p className="text-center text-slate-500 italic py-6">No hay configuraciones de pensión completa para jugadores.</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="col-span-5">Tipo Alojamiento</div>
                  <div className="col-span-3">Noches</div>
                  <div className="col-span-3">Precio/Jug.</div>
                </div>
                {settings.precios_jugadores.map((fila, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-black/30 p-3 rounded-2xl border border-white/5 group">
                    <div className="col-span-5">
                      <select value={fila.tipo_alojamiento} onChange={e => updatePrecioJugador(idx, 'tipo_alojamiento', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white outline-none">
                        <option value="Hotel">Hotel</option>
                        <option value="Camping">Camping</option>
                        <option value="Albergue">Albergue</option>
                        <option value="Resort">Resort</option>
                      </select>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <input type="number" value={fila.noches} onChange={e => updatePrecioJugador(idx, 'noches', Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-center text-white outline-none" />
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <input type="number" value={fila.precio} onChange={e => updatePrecioJugador(idx, 'precio', Number(e.target.value))} className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 text-sm font-bold text-center text-blue-400 outline-none" />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button type="button" onClick={() => removePrecioJugador(idx)} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MATRIZ ACOMPAÑANTES */}
          <div className="bg-[#162032]/80 border border-white/5 p-8 rounded-[32px] shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-white/5 pb-4 gap-4">
              <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-3">
                <BedDouble className="text-purple-400" /> Matriz Acompañantes
              </h2>
              <button onClick={addPrecioAcompa} className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all">
                <Plus size={14} /> Añadir Fila
              </button>
            </div>
            
            {settings.precios_acompanantes.length === 0 ? (
              <p className="text-center text-slate-500 italic py-6">No hay configuraciones para familias y acompañantes.</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="col-span-3">Alojamiento</div>
                  <div className="col-span-4">Habitación</div>
                  <div className="col-span-2">Noches</div>
                  <div className="col-span-2">Precio/Pax</div>
                </div>
                {settings.precios_acompanantes.map((fila, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-black/30 p-3 rounded-2xl border border-white/5 group">
                    <div className="col-span-3">
                      <select value={fila.tipo_alojamiento} onChange={e => updatePrecioAcompa(idx, 'tipo_alojamiento', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white outline-none">
                        <option value="Hotel">Hotel</option>
                        <option value="Camping">Camping</option>
                        <option value="Albergue">Albergue</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <select value={fila.habitacion} onChange={e => updatePrecioAcompa(idx, 'habitacion', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white outline-none">
                        <option value="Múltiple (3+)">Hab. Múltiple (3+)</option>
                        <option value="Doble">Hab. Doble</option>
                        <option value="Single">Hab. Single</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={fila.noches} onChange={e => updatePrecioAcompa(idx, 'noches', Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-center text-white outline-none" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={fila.precio} onChange={e => updatePrecioAcompa(idx, 'precio', Number(e.target.value))} className="w-full bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 text-xs font-bold text-center text-purple-400 outline-none" />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button type="button" onClick={() => removePrecioAcompa(idx)} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl flex items-start gap-3">
              <Tag className="text-purple-400 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-slate-400 leading-relaxed">Las cunas o menores de 2 años se gestionarán sin coste durante el checkout de las familias. Asegúrate de configurar aquí los precios en base a Media Pensión o Pensión Completa según las normas de tu torneo.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}