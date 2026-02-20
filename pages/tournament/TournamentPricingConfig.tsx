import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { Wallet, Save, RefreshCw, Settings, Users, Shield, BedDouble, Plus, Trash2, Tag, Euro, ArrowLeft } from "lucide-react";

export default function TournamentPricingConfig({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [torneoId, setTorneoId] = useState<string | null>(null);

  // ESTADO GLOBAL LIMPIO
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

    const { error } = await supabase
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
      .eq("id", torneoId);

    setSaving(false);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert("✅ Configuración guardada. Los cálculos de deuda se actualizarán automáticamente.");
      onClose(); // Cerramos al guardar
    }
  };

  // --- FUNCIONES MATRIZ DINÁMICA (Tus funciones originales) ---
  const addPrecioJugador = () => setSettings({ ...settings, precios_jugadores: [...settings.precios_jugadores, { tipo_alojamiento: "Hotel", noches: 3, precio: 300 }] });
  const removePrecioJugador = (index: number) => { const newArr = [...settings.precios_jugadores]; newArr.splice(index, 1); setSettings({ ...settings, precios_jugadores: newArr }); };
  const updatePrecioJugador = (index: number, field: string, value: any) => { const newArr = [...settings.precios_jugadores]; newArr[index][field] = value; setSettings({ ...settings, precios_jugadores: newArr }); };
  const addPrecioAcompa = () => setSettings({ ...settings, precios_acompanantes: [...settings.precios_acompanantes, { tipo_alojamiento: "Hotel", habitacion: "Doble", noches: 3, precio: 250 }] });
  const removePrecioAcompa = (index: number) => { const newArr = [...settings.precios_acompanantes]; newArr.splice(index, 1); setSettings({ ...settings, precios_acompanantes: newArr }); };
  const updatePrecioAcompa = (index: number, field: string, value: any) => { const newArr = [...settings.precios_acompanantes]; newArr[index][field] = value; setSettings({ ...settings, precios_acompanantes: newArr }); };

  if (loading) return <div className="p-10 text-center text-white">Cargando configuración...</div>;

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-50 overflow-y-auto animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* HEADER DE NAVEGACIÓN */}
        <div className="flex items-center justify-between mb-8">
            <button onClick={onClose} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10">
                    <ArrowLeft size={20} />
                </div>
                <span className="font-bold uppercase tracking-widest text-xs">Volver al Hub Financiero</span>
            </button>
            <div className="text-right">
                <h1 className="text-2xl font-black text-white italic uppercase">Motor de Precios</h1>
                <p className="text-slate-500 text-xs">Configuración Maestra</p>
            </div>
        </div>

        {/* TU FORMULARIO ORIGINAL (Sin cambios visuales) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-8">
                {/* Reglas Base */}
                <div className="bg-[#162032] border border-white/5 p-8 rounded-[32px]">
                    <h2 className="text-xl font-black text-white italic uppercase mb-6 flex items-center gap-3 border-b border-white/5 pb-4"><Wallet className="text-emerald-500" /> Reglas Base</h2>
                    <div className="space-y-5">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Paga y Señal (Por Equipo)</label>
                            <div className="relative"><Euro size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" /><input type="number" value={settings.fee_reserva_equipo} onChange={e => setSettings({...settings, fee_reserva_equipo: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-bold outline-none focus:border-emerald-500/50" /></div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Inscripción SIN alojamiento</label>
                            <div className="relative"><Euro size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" /><input type="number" value={settings.cuota_sin_alojamiento} onChange={e => setSettings({...settings, cuota_sin_alojamiento: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-bold outline-none focus:border-emerald-500/50" /></div>
                        </div>
                    </div>
                </div>
                {/* Descuentos Staff */}
                <div className="bg-[#162032] border border-white/5 p-8 rounded-[32px]">
                    <h2 className="text-xl font-black text-white italic uppercase mb-6 flex items-center gap-3 border-b border-white/5 pb-4"><Shield className="text-amber-500" /> Bonificaciones Staff</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                            <span className="text-sm font-bold text-slate-300">1º Entrenador</span>
                            <div className="flex items-center gap-2"><input type="number" value={settings.dto_entrenador_1} onChange={e => setSettings({...settings, dto_entrenador_1: Number(e.target.value)})} className="w-16 bg-black/60 border border-white/10 rounded-lg py-1 px-2 text-center text-amber-500 font-black outline-none" /><span className="text-xs text-slate-500">% Dto.</span></div>
                        </div>
                        <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                            <span className="text-sm font-bold text-slate-300">2º Entrenador</span>
                            <div className="flex items-center gap-2"><input type="number" value={settings.dto_entrenador_2} onChange={e => setSettings({...settings, dto_entrenador_2: Number(e.target.value)})} className="w-16 bg-black/60 border border-white/10 rounded-lg py-1 px-2 text-center text-amber-500 font-black outline-none" /><span className="text-xs text-slate-500">% Dto.</span></div>
                        </div>
                        <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                            <span className="text-sm font-bold text-slate-300">Resto Staff</span>
                            <div className="flex items-center gap-2"><input type="number" value={settings.dto_entrenador_extra} onChange={e => setSettings({...settings, dto_entrenador_extra: Number(e.target.value)})} className="w-16 bg-black/60 border border-white/10 rounded-lg py-1 px-2 text-center text-amber-500 font-black outline-none" /><span className="text-xs text-slate-500">% Dto.</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA (Matrices) */}
            <div className="xl:col-span-2 space-y-8">
                {/* Matriz Jugadores */}
                <div className="bg-[#162032] border border-white/5 p-8 rounded-[32px]">
                    <div className="flex justify-between mb-6 border-b border-white/5 pb-4"><h2 className="text-xl font-black text-white italic uppercase flex items-center gap-3"><Users className="text-blue-400" /> Matriz Jugadores</h2><button onClick={addPrecioJugador} className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-blue-500 hover:text-white transition-all"><Plus size={14} /> Añadir Fila</button></div>
                    <div className="space-y-3">
                        {settings.precios_jugadores.map((fila, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-black/30 p-3 rounded-2xl border border-white/5">
                                <div className="col-span-5"><select value={fila.tipo_alojamiento} onChange={e => updatePrecioJugador(idx, 'tipo_alojamiento', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white outline-none"><option value="Hotel">Hotel</option><option value="Camping">Camping</option><option value="Albergue">Albergue</option><option value="Resort">Resort</option></select></div>
                                <div className="col-span-3"><input type="number" value={fila.noches} onChange={e => updatePrecioJugador(idx, 'noches', Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-center text-white outline-none" /></div>
                                <div className="col-span-3"><input type="number" value={fila.precio} onChange={e => updatePrecioJugador(idx, 'precio', Number(e.target.value))} className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 text-sm font-bold text-center text-blue-400 outline-none" /></div>
                                <div className="col-span-1 flex justify-center"><button type="button" onClick={() => removePrecioJugador(idx)} className="text-slate-600 hover:text-red-500"><Trash2 size={16}/></button></div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Matriz Acompañantes */}
                <div className="bg-[#162032] border border-white/5 p-8 rounded-[32px]">
                    <div className="flex justify-between mb-6 border-b border-white/5 pb-4"><h2 className="text-xl font-black text-white italic uppercase flex items-center gap-3"><BedDouble className="text-purple-400" /> Matriz Acompañantes</h2><button onClick={addPrecioAcompa} className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-purple-500 hover:text-white transition-all"><Plus size={14} /> Añadir Fila</button></div>
                    <div className="space-y-3">
                        {settings.precios_acompanantes.map((fila, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-black/30 p-3 rounded-2xl border border-white/5">
                                <div className="col-span-3"><select value={fila.tipo_alojamiento} onChange={e => updatePrecioAcompa(idx, 'tipo_alojamiento', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"><option value="Hotel">Hotel</option><option value="Camping">Camping</option><option value="Albergue">Albergue</option></select></div>
                                <div className="col-span-4"><select value={fila.habitacion} onChange={e => updatePrecioAcompa(idx, 'habitacion', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"><option value="Múltiple (3+)">Hab. Múltiple (3+)</option><option value="Doble">Hab. Doble</option><option value="Single">Hab. Single</option></select></div>
                                <div className="col-span-2"><input type="number" value={fila.noches} onChange={e => updatePrecioAcompa(idx, 'noches', Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-center text-white outline-none" /></div>
                                <div className="col-span-2"><input type="number" value={fila.precio} onChange={e => updatePrecioAcompa(idx, 'precio', Number(e.target.value))} className="w-full bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 text-xs font-bold text-center text-purple-400 outline-none" /></div>
                                <div className="col-span-1 flex justify-center"><button type="button" onClick={() => removePrecioAcompa(idx)} className="text-slate-600 hover:text-red-500"><Trash2 size={16}/></button></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* FOOTER DE GUARDADO */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#162032] border-t border-white/10 p-4 md:p-6 flex justify-end gap-4 z-50">
            <button onClick={onClose} className="px-8 py-4 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-emerald-500 text-brand-deep px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50">
                {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
        </div>

      </div>
    </div>
  );
}