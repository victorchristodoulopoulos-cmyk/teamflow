import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { Trophy, CheckCircle2, AlertCircle, Users, MapPin, Save, RefreshCw, ChevronRight, Building2 } from "lucide-react";

export default function TournamentCategories() {
  const [loading, setLoading] = useState(true);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, any[]>>({});
  const [torneoId, setTorneoId] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sedes, setSedes] = useState<Record<string, string>>({});
  const [savingSede, setSavingSede] = useState(false);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("torneo_id").eq("id", user.id).single();

      if (profile?.torneo_id) {
        setTorneoId(profile.torneo_id);

        const { data: torneoData } = await supabase
          .from("torneos")
          .select("sedes_categorias")
          .eq("id", profile.torneo_id)
          .single();
        
        if (torneoData && torneoData.sedes_categorias) {
          setSedes(torneoData.sedes_categorias);
        }

        const { data: inscripciones, error } = await supabase
          .from("inscripciones_torneo")
          .select("id, nombre_club, categorias_confirmadas, estado")
          .eq("torneo_id", profile.torneo_id);

        if (error) throw error;

        if (inscripciones) {
          const map: Record<string, any[]> = {};
          
          inscripciones.forEach(club => {
            let catConfirmadas = club.categorias_confirmadas;
            
            if (!catConfirmadas) {
              catConfirmadas = [];
            } else if (typeof catConfirmadas === 'string') {
              try {
                catConfirmadas = JSON.parse(catConfirmadas);
              } catch (e) {
                catConfirmadas = catConfirmadas.replace(/^{|}$/g, '').split(',').filter(Boolean);
              }
            }

            if (Array.isArray(catConfirmadas)) {
              catConfirmadas.forEach((cat: string) => {
                const cleanCat = cat.trim();
                if (cleanCat) {
                  if (!map[cleanCat]) map[cleanCat] = [];
                  map[cleanCat].push(club);
                }
              });
            }
          });

          const sortedMap = Object.keys(map).sort().reduce((acc, key) => {
            acc[key] = map[key];
            return acc;
          }, {} as Record<string, any[]>);

          setCategoriesMap(sortedMap);
          
          if (Object.keys(sortedMap).length > 0 && !selectedCategory) {
            setSelectedCategory(Object.keys(sortedMap)[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error crítico cargando categorías:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSede = async () => {
    if (!torneoId || !selectedCategory) return;
    setSavingSede(true);

    const { error } = await supabase
      .from("torneos")
      .update({ sedes_categorias: sedes })
      .eq("id", torneoId);

    setSavingSede(false);
    if (!error) {
      // Pequeño feedback visual de éxito sin usar alert intrusivo
      const btn = document.getElementById('save-sede-btn');
      if (btn) {
        btn.classList.add('bg-green-500', 'text-white');
        setTimeout(() => btn.classList.remove('bg-green-500', 'text-white'), 1500);
      }
    } else {
      alert("Error al guardar la sede.");
    }
  };

  const handleSedeChange = (val: string) => {
    if (selectedCategory) {
      setSedes(prev => ({ ...prev, [selectedCategory]: val }));
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const categoryKeys = Object.keys(categoriesMap);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      
      {/* HEADER PRINCIPAL COMPACTO Y FILTRO INTEGRADO */}
      <div className="bg-[#162032] border border-white/5 p-6 md:p-8 rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col xl:flex-row justify-between xl:items-end gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 mb-3">
            <Trophy size={12} /> Gestión de Competición
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
            Cuadrantes
          </h1>
        </div>

        {/* 🔥 FILTRO HORIZONTAL INTEGRADO EN EL HEADER (Scrollable) */}
        {categoryKeys.length > 0 && (
          <div className="relative z-10 w-full xl:w-auto xl:max-w-[60%] flex overflow-x-auto gap-2 pb-2 xl:pb-0 scroll-smooth items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`::-webkit-scrollbar { display: none; }`}</style> {/* Oculta scrollbar en Chrome/Safari */}
            
            {categoryKeys.map((cat) => {
              const isActive = selectedCategory === cat;
              const numEquipos = categoriesMap[cat].length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl transition-all border ${
                    isActive 
                      ? 'bg-amber-500 text-brand-deep border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                      : 'bg-black/30 text-slate-400 border-white/5 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <span className="font-black italic text-sm">{cat}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg ${isActive ? 'bg-black/20 text-brand-deep' : 'bg-white/10 text-slate-300'}`}>
                    {numEquipos} {numEquipos === 1 ? 'Eq' : 'Eqs'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {categoryKeys.length === 0 ? (
        <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[32px] bg-[#162032]/30">
          <AlertCircle size={40} className="text-amber-500 mb-4 opacity-50" />
          <h3 className="text-xl font-black text-white italic tracking-tight">Sin equipos confirmados</h3>
          <p className="text-slate-500 mt-2">Ve a la pestaña "Clubes & Equipos", entra en la ficha de un club y valida sus equipos.</p>
        </div>
      ) : (
        selectedCategory && (
          /* CONTENIDO DE LA CATEGORÍA MAXIMIZADO */
          <div className="bg-[#162032]/80 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
            
            {/* 🔥 TOP BAR: TÍTULO Y SEDE EN UNA LÍNEA (Súper compacto) */}
            <div className="p-6 md:px-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02]">
              
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tight">
                  {selectedCategory}
                </h2>
                <div className="h-6 w-px bg-white/10 hidden md:block"></div>
                <p className="text-slate-400 text-sm font-medium">Listado oficial de inscritos</p>
              </div>

              {/* INPUT DE SEDE MINIMALISTA */}
              <div className="flex flex-1 md:flex-none justify-end">
                <div className="flex items-center w-full md:w-[350px] bg-black/40 border border-white/10 rounded-2xl p-1.5 focus-within:border-amber-500/50 transition-colors shadow-inner">
                  <div className="pl-3 pr-2 text-amber-500 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Sede / Campo de juego..."
                    value={sedes[selectedCategory] || ""}
                    onChange={(e) => handleSedeChange(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder:text-slate-600 font-bold w-full"
                  />
                  <button 
                    id="save-sede-btn"
                    onClick={handleSaveSede}
                    disabled={savingSede}
                    title="Guardar sede"
                    className="bg-white/10 hover:bg-amber-500 hover:text-brand-deep text-slate-300 p-2.5 rounded-xl transition-all shrink-0 ml-2"
                  >
                    {savingSede ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  </button>
                </div>
              </div>

            </div>

            {/* LISTADO DE EQUIPOS (MAXIMIZA ANCHO COMPLETO) */}
            <div className="divide-y divide-white/5">
              {(categoriesMap[selectedCategory] as any[]).map((club, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 px-6 md:px-8 hover:bg-white/[0.03] transition-colors gap-4 group">
                  
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-slate-500 shrink-0 group-hover:border-amber-500/50 group-hover:text-amber-500 transition-colors">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-lg font-black text-white uppercase tracking-tight">{club.nombre_club}</p>
                      <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> Confirmado Oficialmente
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 pl-17 sm:pl-0">
                    {club.estado === 'pendiente' && (
                      <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg">
                        Club Pendiente
                      </span>
                    )}
                    {/* Botón visual para ir al club (decorativo o funcional si le pones navigate) */}
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 hover:bg-amber-500 hover:text-brand-deep transition-all cursor-pointer">
                      <ChevronRight size={20} />
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )
      )}
    </div>
  );
}