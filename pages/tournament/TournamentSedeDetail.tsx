import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { ArrowLeft, Save, Building2, Clock, MapPin, Activity, Cpu, Calendar, Plus, Trash2, Users, AlertTriangle, CheckCircle2, XCircle, Trophy, Repeat, ShieldAlert } from "lucide-react";

export default function TournamentSedeDetail() {
  const { sedeId } = useParams();
  const navigate = useNavigate();
  const [sede, setSede] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [torneoId, setTorneoId] = useState<string | null>(null);
  
  const [equiposPorCategoria, setEquiposPorCategoria] = useState<Record<string, number>>({});
  const [equiposTotales, setEquiposTotales] = useState<number>(0);
  
  // Ahora manejamos OBJETOS de categorías reales
  const [todasLasCategorias, setTodasLasCategorias] = useState<any[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]); // Array de IDs de categoría
  const [clubesData, setClubesData] = useState<any[]>([]);

  const [stats, setStats] = useState({ 
    minutosPorPartido: 0, 
    partidosPosibles: 0,
    partidosNecesarios: 0,
    maxEquiposPosibles: 0,
    viabilidad: 'calculando', 
    mensajeIA: ''
  });

  useEffect(() => {
    fetchSedeYDatos();
  }, [sedeId]);

  const fetchSedeYDatos = async () => {
    const { data: sedeData } = await supabase.from("sedes_torneo").select("*").eq("id", sedeId).single();
    
    if (sedeData) {
      if (!sedeData.dias_json || sedeData.dias_json.length === 0) {
        sedeData.dias_json = [{ dia: 1, nombre: "Día 1", franjas: [{ inicio: "09:00", fin: "14:00" }, { inicio: "16:00", fin: "20:00" }] }];
      }
      setSede(sedeData);
      setTorneoId(sedeData.torneo_id);

      // 1. Cargar clubes
      const { data: inscripciones } = await supabase.from("inscripciones_torneo").select("categorias_confirmadas").eq("torneo_id", sedeData.torneo_id);
      if (inscripciones) setClubesData(inscripciones);

      // 2. Cargar TODAS las categorías maestras del torneo
      const { data: catOficiales } = await supabase.from("categorias_torneo").select("*").eq("torneo_id", sedeData.torneo_id).order("nombre");
      
      if (catOficiales) {
        setTodasLasCategorias(catOficiales);
        
        // Cuales tienen asignado ESTA sede_id
        const catsEnEstaSede = catOficiales.filter(c => c.sede_id === sedeData.id).map(c => c.id);
        setCategoriasSeleccionadas(catsEnEstaSede);
        
        contarEquiposYCalcular(catsEnEstaSede, catOficiales, inscripciones || [], sedeData);
      }
    }
    setLoading(false);
  };

  const contarEquiposYCalcular = (catIdsSeleccionados: string[], allCats: any[], clubes: any[], datosSede: any) => {
    let recuentoLocal: Record<string, number> = {};
    let total = 0;
    
    // Nombres de las categorías seleccionadas para poder cruzarlas con los strings de los clubes
    const nombresSeleccionados = allCats.filter(c => catIdsSeleccionados.includes(c.id)).map(c => c.nombre);

    nombresSeleccionados.forEach(nombre => recuentoLocal[nombre] = 0);

    clubes.forEach(club => {
      const confirmadas = club.categorias_confirmadas || [];
      confirmadas.forEach((cat: string) => {
        const c = cat.trim();
        if (nombresSeleccionados.includes(c)) {
          recuentoLocal[c] += 1;
          total++;
        }
      });
    });
    
    setEquiposPorCategoria(recuentoLocal);
    setEquiposTotales(total);
    calcularLogistica(datosSede, recuentoLocal, total);
  };

  const toggleCategoria = (catId: string) => {
    const nuevasCats = categoriasSeleccionadas.includes(catId)
      ? categoriasSeleccionadas.filter(id => id !== catId)
      : [...categoriasSeleccionadas, catId];
    
    setCategoriasSeleccionadas(nuevasCats);
    contarEquiposYCalcular(nuevasCats, todasLasCategorias, clubesData, sede);
  };

  const calcularLogistica = (datos: any, mapaEquipos: Record<string, number>, totalEqs: number) => {
    try {
      let minutosTotales = 0;
      datos.dias_json.forEach((dia: any) => {
        dia.franjas.forEach((franja: any) => {
          const [hInicio, mInicio] = franja.inicio.split(':');
          const [hFin, mFin] = franja.fin.split(':');
          const start = parseInt(hInicio) * 60 + parseInt(mInicio);
          let end = parseInt(hFin) * 60 + parseInt(mFin);
          if (end < start) end += 24 * 60; 
          minutosTotales += (end - start);
        });
      });

      const duracionParte = parseInt(datos.duracion_parte) || 20;
      const numPartes = parseInt(datos.num_partes) || 2;
      const descanso = parseInt(datos.descanso_min) || 5;
      const rotacion = parseInt(datos.rotacion_min) || 10;
      const minutosPorPartido = (duracionParte * numPartes) + (descanso * (numPartes - 1)) + rotacion;

      const partidosPorCampo = Math.floor(minutosTotales / (minutosPorPartido || 1)); 
      const totalPartidosPosibles = partidosPorCampo * (parseInt(datos.campos_disponibles) || 1);

      const formatoGrupo = parseInt(datos.formato_grupos) || 4;
      const esIdaYVuelta = datos.ida_y_vuelta;
      const hayFasePlata = datos.fase_plata;
      let factorFaseGrupos = esIdaYVuelta ? 2 : 1;
      let partidosPorGrupo = (formatoGrupo === 4 ? 6 : 3) * factorFaseGrupos;

      let partidosNecesariosTotales = 0;
      let detallePropuesta = "";

      Object.entries(mapaEquipos).forEach(([cat, numEquipos]) => {
        if (numEquipos > 0) {
          const numGrupos = Math.ceil(numEquipos / formatoGrupo);
          const partidosFaseGrupos = numGrupos * partidosPorGrupo;
          let partidosCruces = numGrupos >= 2 ? 7 : 3; 
          if (hayFasePlata && numGrupos >= 2) partidosCruces += 7; 

          const totalCat = partidosFaseGrupos + partidosCruces;
          partidosNecesariosTotales += totalCat;
          detallePropuesta += `• ${cat}: ${numEquipos} eqs (${numGrupos} Grupos). Req: ~${totalCat} partidos.\n`;
        }
      });

      if (totalEqs === 0) {
        detallePropuesta = "Añade categorías para calcular el formato logístico detallado.";
      }

      let partidosCrucesPorCat = 7 + (hayFasePlata ? 7 : 0);
      let slotsLibresParaGrupos = totalPartidosPosibles - (Object.keys(mapaEquipos).length * partidosCrucesPorCat);
      let maxEquiposPosibles = 0;
      
      if (slotsLibresParaGrupos > 0) {
        const maxGruposGlobal = Math.floor(slotsLibresParaGrupos / partidosPorGrupo);
        maxEquiposPosibles = maxGruposGlobal * formatoGrupo;
      }

      let viabilidad = 'ok';
      let mensajeIA = detallePropuesta;

      if (totalEqs === 0) {
        viabilidad = 'warning';
      } else if (totalPartidosPosibles < partidosNecesariosTotales) {
        viabilidad = 'error';
        mensajeIA += `\n❌ PELIGRO: Te faltan ${partidosNecesariosTotales - totalPartidosPosibles} slots para cubrir todas las categorías.`;
      } else if (totalPartidosPosibles - partidosNecesariosTotales <= 3) {
        viabilidad = 'warning';
        mensajeIA += `\n⚠️ ALERTA: Sobran solo ${totalPartidosPosibles - partidosNecesariosTotales} slots. Un retraso y colapsas.`;
      } else {
        viabilidad = 'ok';
        mensajeIA += `\n✅ VIABLE: Tienes ${totalPartidosPosibles - partidosNecesariosTotales} slots de margen para imprevistos.`;
      }

      setStats({
        minutosPorPartido,
        partidosPosibles: totalPartidosPosibles,
        partidosNecesarios: partidosNecesariosTotales,
        maxEquiposPosibles,
        viabilidad,
        mensajeIA
      });

    } catch(e) {
      console.error("Error en motor IA:", e);
    }
  };

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    const newVal = { ...sede, [e.target.name]: value };
    setSede(newVal);
    calcularLogistica(newVal, equiposPorCategoria, equiposTotales);
  };

  const addDia = () => {
    const newDias = [...sede.dias_json, { dia: sede.dias_json.length + 1, nombre: `Día ${sede.dias_json.length + 1}`, franjas: [{ inicio: "09:00", fin: "14:00" }] }];
    const newVal = { ...sede, dias_json: newDias };
    setSede(newVal);
    calcularLogistica(newVal, equiposPorCategoria, equiposTotales);
  };

  const removeDia = (diaIndex: number) => {
    const newDias = [...sede.dias_json];
    newDias.splice(diaIndex, 1);
    const newVal = { ...sede, dias_json: newDias };
    setSede(newVal);
    calcularLogistica(newVal, equiposPorCategoria, equiposTotales);
  };

  const addFranja = (diaIndex: number) => {
    const newDias = [...sede.dias_json];
    newDias[diaIndex].franjas.push({ inicio: "16:00", fin: "20:00" });
    const newVal = { ...sede, dias_json: newDias };
    setSede(newVal);
    calcularLogistica(newVal, equiposPorCategoria, equiposTotales);
  };

  const updateFranja = (diaIndex: number, franjaIndex: number, field: string, value: string) => {
    const newDias = [...sede.dias_json];
    newDias[diaIndex].franjas[franjaIndex][field] = value;
    const newVal = { ...sede, dias_json: newDias };
    setSede(newVal);
    calcularLogistica(newVal, equiposPorCategoria, equiposTotales);
  };

  const removeFranja = (diaIndex: number, franjaIndex: number) => {
    const newDias = [...sede.dias_json];
    newDias[diaIndex].franjas.splice(franjaIndex, 1);
    const newVal = { ...sede, dias_json: newDias };
    setSede(newVal);
    calcularLogistica(newVal, equiposPorCategoria, equiposTotales);
  };

  const handleSave = async () => {
    setSaving(true);
    // 1. Guardar la sede
    await supabase.from("sedes_torneo").update({
      nombre: sede.nombre,
      direccion: sede.direccion,
      campos_disponibles: parseInt(sede.campos_disponibles),
      duracion_parte: parseInt(sede.duracion_parte),
      num_partes: parseInt(sede.num_partes),
      descanso_min: parseInt(sede.descanso_min),
      rotacion_min: parseInt(sede.rotacion_min),
      formato_grupos: sede.formato_grupos,
      ida_y_vuelta: sede.ida_y_vuelta,
      fase_plata: sede.fase_plata,
      dias_json: sede.dias_json
    }).eq("id", sede.id);

    // 2. ACTUALIZAR LAS CATEGORÍAS (La gran mejora relacional)
    if (torneoId) {
      // Primero, quitar esta sede_id de todas las categorías que la tuvieran antes
      await supabase.from("categorias_torneo")
        .update({ sede_id: null })
        .eq("torneo_id", torneoId)
        .eq("sede_id", sede.id);

      // Segundo, ponérsela a las que están seleccionadas ahora
      if (categoriasSeleccionadas.length > 0) {
        await supabase.from("categorias_torneo")
          .update({ sede_id: sede.id })
          .in("id", categoriasSeleccionadas);
      }
    }

    setSaving(false);
    
    const btn = document.getElementById('save-sede-btn');
    if (btn) {
      btn.classList.add('bg-green-500');
      btn.classList.remove('bg-purple-500');
      setTimeout(() => { btn.classList.add('bg-purple-500'); btn.classList.remove('bg-green-500'); }, 2000);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!sede) return <div className="text-white text-center p-20">Sede no encontrada</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      
      <div className="bg-[#162032] border border-white/5 p-6 md:p-8 rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-5 w-full">
          <button onClick={() => navigate(-1)} className="text-purple-400 hover:text-white transition-colors bg-white/5 p-3 rounded-2xl"><ArrowLeft size={20} /></button>
          <div className="w-14 h-14 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center text-slate-500 shrink-0"><Building2 size={24} /></div>
          <div className="flex-1">
            <input type="text" name="nombre" value={sede.nombre} onChange={handleBasicChange} className="bg-transparent text-3xl font-black italic text-white uppercase tracking-tighter leading-none border-b border-dashed border-white/20 outline-none focus:border-purple-500 w-full max-w-[300px] mb-1" />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin size={12} className="text-purple-400 shrink-0" /> 
              <input type="text" name="direccion" value={sede.direccion || ''} onChange={handleBasicChange} placeholder="Añadir dirección de la instalación..." className="bg-transparent outline-none border-b border-transparent focus:border-purple-500 w-full max-w-[250px]" />
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-6 shrink-0">
          <div className="text-right">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1 flex items-center justify-end gap-1.5"><Users size={12}/> Uso Actual</p>
            <p className="text-2xl font-black text-white italic">{equiposTotales} Eqs.</p>
          </div>
          <div className="w-px h-10 bg-white/10 hidden md:block"></div>
          <button id="save-sede-btn" onClick={handleSave} disabled={saving} className="bg-purple-500 text-white px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-purple-400 transition-colors flex items-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:opacity-50">
            <Save size={16} /> {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <div className="bg-[#162032]/80 border border-white/5 rounded-[32px] p-6 shadow-xl xl:col-span-3">
          <h2 className="text-sm font-black text-white italic uppercase flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-amber-500" /> Categorías alojadas
          </h2>
          {todasLasCategorias.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No tienes categorías creadas. Ve a "Categorías" para configurarlas.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {todasLasCategorias.map(cat => {
                const isSelected = categoriasSeleccionadas.includes(cat.id);
                const eqsInCat = equiposPorCategoria[cat.nombre] || 0;
                return (
                  <button key={cat.id} onClick={() => toggleCategoria(cat.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all border ${isSelected ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-black/30 text-slate-500 border-white/10 hover:border-white/30'}`}>
                    {isSelected && <CheckCircle2 size={12} />} 
                    {cat.nombre} {isSelected && <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-white ml-1">{eqsInCat}</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[#162032]/80 border border-white/5 rounded-[32px] p-6 shadow-xl">
            <h2 className="text-sm font-black text-white italic uppercase flex items-center gap-2 border-b border-white/5 pb-3 mb-4"><Clock size={16} className="text-purple-400" /> Tiempos & Infraestructura</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/10">
                <span className="text-xs font-bold text-slate-300">Nº Campos Jugables</span>
                <input type="number" name="campos_disponibles" value={sede.campos_disponibles} onChange={handleBasicChange} min="1" className="w-14 bg-white/5 border border-white/10 rounded-lg py-1 text-center text-white outline-none focus:border-purple-500" />
              </div>
              <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/10">
                <span className="text-xs font-bold text-slate-300">Duración 1 Parte</span>
                <div className="flex items-center gap-1"><input type="number" name="duracion_parte" value={sede.duracion_parte} onChange={handleBasicChange} className="w-12 bg-white/5 border border-white/10 rounded-lg py-1 text-center text-white outline-none" /><span className="text-[10px] text-slate-500">m</span></div>
              </div>
              <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/10">
                <span className="text-xs font-bold text-slate-300">Número de Partes</span>
                <select name="num_partes" value={sede.num_partes} onChange={handleBasicChange} className="w-14 bg-white/5 border border-white/10 rounded-lg py-1 text-center text-white outline-none"><option>1</option><option>2</option><option>3</option><option>4</option></select>
              </div>
              <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/10">
                <span className="text-xs font-bold text-slate-300">Descanso Medio Tiempo</span>
                <div className="flex items-center gap-1"><input type="number" name="descanso_min" value={sede.descanso_min} onChange={handleBasicChange} className="w-12 bg-white/5 border border-white/10 rounded-lg py-1 text-center text-white outline-none" /><span className="text-[10px] text-slate-500">m</span></div>
              </div>
              <div className="flex items-center justify-between bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20">
                <span className="text-xs font-bold text-purple-400">Cambio Eq. (Rotación)</span>
                <div className="flex items-center gap-1"><input type="number" name="rotacion_min" value={sede.rotacion_min} onChange={handleBasicChange} className="w-12 bg-purple-500/20 border border-purple-500/30 rounded-lg py-1 text-center text-purple-300 outline-none" /><span className="text-[10px] text-purple-500">m</span></div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-0.5">Total Slot por Partido</p>
              <p className="text-2xl font-black italic text-white">{stats.minutosPorPartido} <span className="text-xs normal-case text-slate-400">min.</span></p>
            </div>
          </div>

          <div className="bg-[#162032]/80 border border-white/5 rounded-[32px] p-6 shadow-xl">
            <h2 className="text-sm font-black text-white italic uppercase flex items-center gap-2 border-b border-white/5 pb-3 mb-4"><Activity size={16} className="text-purple-400" /> Formato de Competición</h2>
            <div className="space-y-4">
              <div className="bg-black/30 p-3 rounded-xl border border-white/10">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Tamaño de Grupos</label>
                <select name="formato_grupos" value={sede.formato_grupos} onChange={handleBasicChange} className="w-full bg-transparent text-sm font-bold text-white outline-none border-b border-white/10 focus:border-purple-500 pb-1">
                  <option value="3">Grupos de 3 (Triangulares)</option>
                  <option value="4">Grupos de 4 (Clásico)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <Repeat size={14} className={sede.ida_y_vuelta ? "text-purple-400" : "text-slate-500"}/>
                    <span className="text-xs font-bold text-slate-300">Fase Grupos Ida y Vuelta</span>
                  </div>
                  <input type="checkbox" name="ida_y_vuelta" checked={sede.ida_y_vuelta} onChange={handleBasicChange} className="w-4 h-4 accent-purple-500" />
                </label>

                <label className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className={sede.fase_plata ? "text-slate-300" : "text-slate-500"}/>
                    <div>
                      <span className="text-xs font-bold text-slate-300 block">Jugar Fase Plata</span>
                      <span className="text-[9px] text-slate-500 leading-none">Todos juegan eliminatorias (Oro y Plata)</span>
                    </div>
                  </div>
                  <input type="checkbox" name="fase_plata" checked={sede.fase_plata} onChange={handleBasicChange} className="w-4 h-4 accent-purple-500" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#162032]/80 border border-white/5 rounded-[32px] p-6 shadow-xl xl:col-span-1">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <h2 className="text-sm font-black text-white italic uppercase flex items-center gap-2">
              <Calendar size={16} className="text-purple-400" /> Disponibilidad
            </h2>
            <button onClick={addDia} className="text-[10px] font-bold text-purple-400 hover:text-white transition-colors flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">
              <Plus size={12}/> Añadir Día
            </button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {sede.dias_json?.map((dia: any, dIndex: number) => (
              <div key={dIndex} className="bg-black/20 border border-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <input type="text" value={dia.nombre} onChange={(e) => {
                    const newDias = [...sede.dias_json];
                    newDias[dIndex].nombre = e.target.value;
                    setSede({...sede, dias_json: newDias});
                  }} className="bg-transparent font-black text-white uppercase italic outline-none w-1/2 focus:border-b focus:border-purple-500 text-sm" />
                  
                  <div className="flex gap-2">
                    <button onClick={() => addFranja(dIndex)} title="Añadir franja" className="text-slate-400 hover:text-purple-400 transition-colors"><Plus size={14}/></button>
                    <button onClick={() => removeDia(dIndex)} title="Eliminar día" className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {dia.franjas.map((franja: any, fIndex: number) => (
                    <div key={fIndex} className="flex items-center gap-2 bg-white/5 p-1.5 rounded-lg">
                      <div className="flex-1 flex items-center justify-center gap-2">
                        <input type="time" value={franja.inicio} onChange={(e) => updateFranja(dIndex, fIndex, 'inicio', e.target.value)} className="bg-black/50 text-white text-xs p-1 rounded outline-none border border-white/10 font-mono" />
                        <span className="text-slate-500 text-xs">-</span>
                        <input type="time" value={franja.fin} onChange={(e) => updateFranja(dIndex, fIndex, 'fin', e.target.value)} className="bg-black/50 text-white text-xs p-1 rounded outline-none border border-white/10 font-mono" />
                      </div>
                      <button onClick={() => removeFranja(dIndex, fIndex)} className="text-slate-500 hover:text-red-400 p-1"><XCircle size={12}/></button>
                    </div>
                  ))}
                  {dia.franjas.length === 0 && <p className="text-[10px] text-slate-500 italic py-1 text-center">Sin horarios.</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`bg-gradient-to-br border rounded-[32px] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between ${
          stats.viabilidad === 'error' ? 'from-red-900/40 to-black border-red-500/50' : 
          stats.viabilidad === 'warning' ? 'from-orange-900/40 to-black border-orange-500/50' : 
          'from-green-900/20 to-[#0A0F18] border-green-500/30'
        }`}>
          
          <div>
            <h2 className="text-sm font-black text-white italic uppercase flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <Cpu size={16} className={stats.viabilidad === 'error' ? 'text-red-400' : stats.viabilidad === 'warning' ? 'text-orange-400' : 'text-green-400'} /> 
              Cerebro Logístico
            </h2>
            
            <div className="bg-black/60 p-4 rounded-2xl border border-purple-500/30 text-center mb-4">
              <p className="text-[9px] uppercase tracking-widest text-purple-400 mb-0.5">Límite Máximo Teórico Global</p>
              <p className="text-3xl font-black text-white italic">{stats.maxEquiposPosibles} <span className="text-xs normal-case text-slate-400">Eqs. en Total</span></p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Slots Disponibles</p>
                <p className="text-2xl font-black text-white">{stats.partidosPosibles}</p>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Slots Requeridos</p>
                <p className={`text-2xl font-black ${stats.partidosNecesarios > stats.partidosPosibles ? 'text-red-500' : 'text-white'}`}>{stats.partidosNecesarios}</p>
              </div>
            </div>

            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed border-l-2 border-l-purple-500 whitespace-pre-line">
              {stats.mensajeIA}
            </div>
          </div>

          <div className="mt-4">
            {stats.viabilidad === 'ok' && equiposTotales > 0 && (
              <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                <CheckCircle2 size={16} className="shrink-0" />
                <p className="text-xs font-bold leading-tight">Márgenes correctos. Sede estable.</p>
              </div>
            )}
            {stats.viabilidad === 'warning' && equiposTotales > 0 && (
              <div className="flex items-center gap-2 text-orange-400 bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                <AlertTriangle size={16} className="shrink-0" />
                <p className="text-xs font-bold leading-tight">Calendario crítico. Posibles retrasos.</p>
              </div>
            )}
            {stats.viabilidad === 'error' && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                <AlertTriangle size={16} className="shrink-0" />
                <p className="text-xs font-bold leading-tight">Colapso inminente. Faltan horas.</p>
              </div>
            )}
          </div>
          
        </div>

      </div>
    </div>
  );
}