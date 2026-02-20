import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { 
  Trophy, CheckCircle2, AlertCircle, Users, MapPin, Save, 
  RefreshCw, ChevronRight, Building2, Download, Plus, X, ListFilter, Trash2 // 🔥 FIX: Trash2 importado aquí
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TournamentCategories() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [torneoId, setTorneoId] = useState<string | null>(null);
  
  // Datos Maestros (Ahora leen de la tabla categorias_torneo)
  const [categoriasOficiales, setCategoriasOficiales] = useState<any[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, any[]>>({});
  const [listaSedes, setListaSedes] = useState<any[]>([]);
  
  // Estados de Interfaz
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<string>(""); 
  const [savingSede, setSavingSede] = useState(false);
  
  // Añadir nueva categoría
  const [nuevaCat, setNuevaCat] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data: profile } = await supabase.from("profiles").select("torneo_id").eq("id", user.id).single();

      if (profile?.torneo_id) {
        setTorneoId(profile.torneo_id);

        // 1. CARGAMOS LAS CATEGORÍAS REALES DESDE LA NUEVA TABLA
        const { data: catData } = await supabase
          .from("categorias_torneo")
          .select("*")
          .eq("torneo_id", profile.torneo_id)
          .order("nombre");
        
        const catOficiales = catData || [];
        setCategoriasOficiales(catOficiales);

        if (catOficiales.length > 0 && !selectedCategoryName) {
          setSelectedCategoryName(catOficiales[0].nombre);
          setSedeSeleccionada(catOficiales[0].sede_id || "");
        }

        // 2. CARGAMOS LA LISTA DE SEDES
        const { data: sedesData } = await supabase
          .from("sedes_torneo")
          .select("id, nombre")
          .eq("torneo_id", profile.torneo_id);
        
        if (sedesData) setListaSedes(sedesData);

        // 3. CARGAMOS LOS CLUBES Y LOS MAPAMOS (La unión se hace por el 'nombre' de la categoría)
        const { data: inscripciones } = await supabase
          .from("inscripciones_torneo")
          .select("id, nombre_club, email_responsable, telefono, categorias_confirmadas, estado")
          .eq("torneo_id", profile.torneo_id);

        const map: Record<string, any[]> = {};
        
        catOficiales.forEach((cat: any) => {
          map[cat.nombre] = [];
        });

        if (inscripciones) {
          inscripciones.forEach(club => {
            let catConfirmadas = club.categorias_confirmadas;
            if (!catConfirmadas) catConfirmadas = [];
            else if (typeof catConfirmadas === 'string') {
              try { catConfirmadas = JSON.parse(catConfirmadas); } 
              catch (e) { catConfirmadas = catConfirmadas.replace(/^{|}$/g, '').split(',').filter(Boolean); }
            }

            if (Array.isArray(catConfirmadas)) {
              catConfirmadas.forEach((catString: string) => {
                const cleanCat = catString.trim();
                if (cleanCat && map[cleanCat] !== undefined) {
                  map[cleanCat].push(club);
                }
              });
            }
          });
        }
        setCategoriesMap(map);
      }
    } catch (err) {
      console.error("Error crítico cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategoria = async () => {
    if (!nuevaCat.trim() || !torneoId) return;
    const cleanCatName = nuevaCat.trim().toUpperCase();
    
    if (categoriasOficiales.some(c => c.nombre === cleanCatName)) {
      alert("Esta categoría ya existe.");
      return;
    }

    const { data, error } = await supabase
      .from("categorias_torneo")
      .insert([{ torneo_id: torneoId, nombre: cleanCatName }])
      .select();
    
    if (!error && data) {
      const nuevasCats = [...categoriasOficiales, data[0]].sort((a,b) => a.nombre.localeCompare(b.nombre));
      setCategoriasOficiales(nuevasCats);
      setCategoriesMap(prev => ({ ...prev, [cleanCatName]: [] }));
      setNuevaCat("");
      setIsAddingCat(false);
      if (!selectedCategoryName) {
        setSelectedCategoryName(cleanCatName);
        setSedeSeleccionada("");
      }
    }
  };

  const handleRemoveCategoria = async (catId: string, catNombre: string) => {
    if (!window.confirm(`¿Seguro que quieres eliminar la categoría ${catNombre}? No borrará a los equipos de su club, pero la ocultará del torneo.`)) return;

    await supabase.from("categorias_torneo").delete().eq("id", catId);

    const nuevasCats = categoriasOficiales.filter(c => c.id !== catId);
    setCategoriasOficiales(nuevasCats);
    
    if (selectedCategoryName === catNombre) {
      if (nuevasCats.length > 0) {
        setSelectedCategoryName(nuevasCats[0].nombre);
        setSedeSeleccionada(nuevasCats[0].sede_id || "");
      } else {
        setSelectedCategoryName(null);
        setSedeSeleccionada("");
      }
    }
  };

  const selectCategory = (cat: any) => {
    setSelectedCategoryName(cat.nombre);
    setSedeSeleccionada(cat.sede_id || "");
  };

  const handleSaveSede = async () => {
    if (!torneoId || !selectedCategoryName) return;
    setSavingSede(true);

    const catToUpdate = categoriasOficiales.find(c => c.nombre === selectedCategoryName);
    if (!catToUpdate) return;

    const sedeValue = sedeSeleccionada === "" ? null : sedeSeleccionada;

    const { error } = await supabase
      .from("categorias_torneo")
      .update({ sede_id: sedeValue })
      .eq("id", catToUpdate.id);

    setSavingSede(false);
    if (!error) {
      const updatedCats = categoriasOficiales.map(c => c.id === catToUpdate.id ? { ...c, sede_id: sedeValue } : c);
      setCategoriasOficiales(updatedCats);

      const btn = document.getElementById('save-sede-btn');
      if (btn) {
        btn.classList.add('bg-green-500', 'text-white');
        setTimeout(() => btn.classList.remove('bg-green-500', 'text-white'), 1500);
      }
    } else {
      alert("Error al vincular la sede.");
    }
  };

  const exportToCSV = () => {
    if (!selectedCategoryName || !categoriesMap[selectedCategoryName]) return;
    const clubes = categoriesMap[selectedCategoryName];
    const headers = ["Nombre del Club", "Estado", "Email Responsable", "Teléfono"];
    const rows = clubes.map(club => [
      `"${club.nombre_club}"`, club.estado, club.email_responsable || "Sin email", club.telefono || "Sin teléfono"
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Equipos_${selectedCategoryName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto h-[calc(100vh-120px)] flex flex-col">
      
      {/* HEADER COMPACTO SUPERIOR */}
      <div className="bg-[#162032] border border-white/5 p-6 md:px-8 md:py-6 rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-6 shrink-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 mb-2">
            <Trophy size={12} /> Gestión Oficial
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
            Categorías
          </h1>
        </div>

        {categoriasOficiales.length > 0 && (
          <div className="relative z-10 flex items-center gap-6 bg-black/30 p-4 rounded-2xl border border-white/5">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Categorías</p>
              <p className="text-2xl font-black text-white italic leading-none">{categoriasOficiales.length}</p>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Equipos Totales</p>
              <p className="text-2xl font-black text-amber-500 italic leading-none">
                {/* 🔥 FIX: Tipado any para decirle a TS que es un array válido */}
                {Object.values(categoriesMap).reduce((acc: number, curr: any) => acc + (curr?.length || 0), 0)}
              </p>
            </div>
          </div>
        )}
      </div>

      {categoriasOficiales.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[32px] bg-[#162032]/30">
          <ListFilter size={48} className="text-amber-500 mb-6 opacity-50" />
          <h3 className="text-2xl font-black text-white italic tracking-tight">Sin categorías oficiales</h3>
          <p className="text-slate-400 mt-2 mb-8 max-w-md text-center">Crea la estructura de edades y formatos de tu torneo para empezar a organizar a los clubes inscritos.</p>
          
          {isAddingCat ? (
            <div className="flex items-center gap-2 bg-black/60 border border-amber-500/50 rounded-2xl p-2 shadow-2xl">
              <input type="text" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} placeholder="Ej: B12" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddCategoria()} className="w-32 bg-transparent text-white text-lg font-bold outline-none pl-4 uppercase" />
              <button onClick={handleAddCategoria} className="bg-amber-500 text-brand-deep p-3 rounded-xl hover:bg-amber-400 transition-colors"><CheckCircle2 size={20}/></button>
              <button onClick={() => setIsAddingCat(false)} className="text-slate-500 hover:text-white p-3"><X size={20}/></button>
            </div>
          ) : (
            <button onClick={() => setIsAddingCat(true)} className="bg-amber-500 text-brand-deep px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white transition-colors shadow-[0_0_30px_rgba(245,158,11,0.3)]">
              Crear Primera Categoría
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
          
          {/* 🔥 SIDEBAR IZQUIERDO: LISTA DE CATEGORÍAS */}
          <div className="w-full md:w-72 xl:w-80 bg-[#162032]/80 border border-white/5 rounded-[32px] shadow-2xl flex flex-col overflow-hidden shrink-0">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/20">
              <h2 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                <ListFilter size={16} className="text-amber-500" /> Directorio
              </h2>
              <button onClick={() => setIsAddingCat(true)} className="text-amber-500 hover:bg-amber-500/10 p-1.5 rounded-lg transition-colors" title="Añadir Categoría">
                <Plus size={16} />
              </button>
            </div>

            {isAddingCat && (
              <div className="p-4 border-b border-white/5 bg-amber-500/5">
                <div className="flex items-center gap-2 bg-black/40 border border-amber-500/30 rounded-xl p-1.5">
                  <input type="text" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} placeholder="Ej: B12" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddCategoria()} className="flex-1 w-full bg-transparent text-white text-sm font-bold outline-none pl-2 uppercase" />
                  <button onClick={handleAddCategoria} className="bg-amber-500 text-brand-deep p-1.5 rounded-lg"><CheckCircle2 size={14}/></button>
                  <button onClick={() => setIsAddingCat(false)} className="text-slate-500 hover:text-white p-1.5"><X size={14}/></button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
              {categoriasOficiales.map((cat) => {
                const isActive = selectedCategoryName === cat.nombre;
                const numEquipos = categoriesMap[cat.nombre]?.length || 0;
                return (
                  <div key={cat.id} className="relative group">
                    <button
                      onClick={() => selectCategory(cat)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-amber-500/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                          : 'border border-transparent hover:bg-white/5'
                      }`}
                    >
                      <span className={`font-black italic text-base ${isActive ? 'text-amber-500' : 'text-slate-300'}`}>
                        {cat.nombre}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${isActive ? 'bg-amber-500 text-brand-deep' : 'bg-black/40 text-slate-400'}`}>
                        {numEquipos} Eqs
                      </span>
                    </button>
                    {/* Botón Borrar (Solo visible en hover) */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveCategoria(cat.id, cat.nombre); }} 
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-500/90 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Eliminar Categoría"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🔥 PANEL DERECHO: DETALLE DE LA CATEGORÍA */}
          {selectedCategoryName && (
            <div className="flex-1 bg-[#162032]/80 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
              
              <div className="p-6 md:p-8 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tight">
                    {selectedCategoryName}
                  </h2>
                  <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                  
                  {categoriesMap[selectedCategoryName]?.length > 0 && (
                    <button onClick={exportToCSV} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
                      <Download size={16} /> Exportar CSV
                    </button>
                  )}
                </div>

                {/* SELECTOR DE SEDES */}
                <div className="flex items-center w-full lg:w-[400px] bg-black/40 border border-white/10 rounded-2xl p-2 focus-within:border-amber-500/50 transition-colors shadow-inner">
                  <div className="pl-3 pr-2 text-amber-500 shrink-0"><MapPin size={18} /></div>
                  <select 
                    value={sedeSeleccionada}
                    onChange={(e) => setSedeSeleccionada(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white text-sm outline-none font-bold w-full cursor-pointer appearance-none"
                  >
                    <option value="" className="bg-brand-deep text-slate-400">Sin sede asignada...</option>
                    {listaSedes.map(sede => (
                      <option key={sede.id} value={sede.id} className="bg-brand-deep text-white">{sede.nombre}</option>
                    ))}
                  </select>
                  <button id="save-sede-btn" onClick={handleSaveSede} disabled={savingSede} title="Vincular Sede a Categoría" className="bg-white/10 hover:bg-amber-500 hover:text-brand-deep text-slate-300 p-3 rounded-xl transition-all shrink-0 ml-2">
                    {savingSede ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                  </button>
                </div>
              </div>

              {/* LISTADO DE EQUIPOS */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
                {categoriesMap[selectedCategoryName]?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-slate-500">
                    <Building2 size={48} className="mb-4 opacity-20" />
                    <p className="text-lg">No hay equipos confirmados en <strong className="text-white">{selectedCategoryName}</strong></p>
                    <p className="text-sm mt-2 max-w-sm text-center">Cuando los clubes se inscriban y tú confirmes sus equipos, aparecerán en este listado oficial.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 p-4 space-y-2">
                    {(categoriesMap[selectedCategoryName] as any[]).map((club, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#162032] p-5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-colors gap-4 group">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <p className="text-lg font-black text-white uppercase tracking-tight">{club.nombre_club}</p>
                            <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5"><CheckCircle2 size={12} /> Confirmado Oficialmente</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 pl-17 sm:pl-0">
                          {club.estado === 'pendiente' && <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg">Club Pendiente</span>}
                          <button onClick={() => navigate(`/tournament-dashboard/clubs/${club.id}`)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:bg-amber-500 hover:text-brand-deep transition-all text-xs font-bold uppercase tracking-widest">
                            Ver Ficha <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}