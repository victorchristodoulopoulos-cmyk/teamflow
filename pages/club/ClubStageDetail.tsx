import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { getMyClubContext } from "../../supabase/clubService";
import { 
  Map, Calendar, MapPin, ChevronLeft, FileText, 
  Users, Activity, Plane, Building, Download, Info, CheckCircle2, ShieldAlert, DollarSign, Loader2, Save, X, Link as LinkIcon
} from "lucide-react";
import StageItinerary from "./components/StageItinerary"; 
import { pdf } from '@react-pdf/renderer';
import StagePdfDocument from "./components/StagePdfDocument";

// Función auxiliar para leer la configuración JSON de la base de datos
const getFinanceConfig = (config: any) => {
  try {
    const parsed = typeof config === 'string' ? JSON.parse(config) : config;
    if (parsed) {
      return {
        plazos: Array.isArray(parsed.plazos_permitidos) && parsed.plazos_permitidos.length > 0 ? parsed.plazos_permitidos : [1],
        tieneMatricula: !!parsed.tiene_matricula,
        precioMatricula: parsed.precio_matricula || 0
      };
    }
  } catch (e) {
    console.error("Error leyendo JSON:", e);
  }
  return { plazos: [1], tieneMatricula: false, precioMatricula: 0 }; 
};

export default function ClubStageDetail() {
  const { stageId } = useParams();
  const navigate = useNavigate();
  
  const [clubId, setClubId] = useState<string>("");
  const [stage, setStage] = useState<any>(null);
  const [actividades, setActividades] = useState<any[]>([]);
  const [inscritos, setInscritos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  const [activeTab, setActiveTab] = useState('overview');

  // 🔥 ESTADOS FINANCIEROS Y CONFIGURACIÓN DEL STAGE
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editPlazas, setEditPlazas] = useState<string>(""); // Nuevo estado para plazas
  const [allowedInstallments, setAllowedInstallments] = useState<number[]>([1]); 
  const [hasMatricula, setHasMatricula] = useState<boolean>(false);
  const [matriculaPrice, setMatriculaPrice] = useState<string>("");
  const [savingFinances, setSavingFinances] = useState(false);

  useEffect(() => {
    if (stageId) fetchStageData();
  }, [stageId]);

  const fetchStageData = async () => {
    try {
      const { club_id } = await getMyClubContext();
      setClubId(club_id);

      // LEEMOS DE CLUB_STAGES Y EXPANDIMOS STAGES
      const { data: csData } = await supabase
        .from("club_stages")
        .select("*, stages(*)")
        .eq("stage_id", stageId)
        .eq("club_id", club_id)
        .single();

      if (csData && csData.stages) {
        let finalLogo = csData.stages.proveedor_logo;
        if (finalLogo && !finalLogo.startsWith('http')) {
          finalLogo = supabase.storage.from('stage').getPublicUrl(finalLogo).data.publicUrl;
        }
        
        // Fusionamos la info visual con la configuración del club
        setStage({ 
            ...csData.stages, 
            proveedor_logo: finalLogo,
            precio_total: csData.precio_total,
            configuracion_pagos: csData.configuracion_pagos,
            plazas_totales: csData.plazas_totales || 40 // Leemos plazas
        });
      }

      // Actividades
      const { data: actData } = await supabase.from("actividades_stage").select("*").eq("stage_id", stageId).order("dia_numero", { ascending: true }).order("hora_inicio", { ascending: true });
      if (actData) {
        const grouped = Object.values(actData.reduce((acc: any, curr: any) => {
          if (!acc[curr.dia_numero]) acc[curr.dia_numero] = { dia_numero: curr.dia_numero, actividades: [] };
          acc[curr.dia_numero].actividades.push(curr);
          return acc;
        }, {}));
        setActividades(grouped);
      }

      // Inscritos
      const { data: inscData } = await supabase.from("stage_inscripciones").select("*, jugadores(*)").eq("stage_id", stageId).eq("club_id", club_id);
      if (inscData) setInscritos(inscData);

    } catch (error) {
      console.error("Error loading stage details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!stage) return;
    setGeneratingPdf(true);
    try {
      const blob = await pdf(<StagePdfDocument stage={stage} activities={actividades} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Dossier_${stage.nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error al generar el dossier.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const openFinanceModal = () => {
    setEditPrice(stage?.precio_total?.toString() || "0");
    setEditPlazas(stage?.plazas_totales?.toString() || "40"); // Cargamos plazas
    const parsedConfig = getFinanceConfig(stage?.configuracion_pagos);
    setAllowedInstallments(parsedConfig.plazos);
    setHasMatricula(parsedConfig.tieneMatricula);
    setMatriculaPrice(parsedConfig.precioMatricula.toString());
    setIsFinanceModalOpen(true);
  };

  const toggleInstallment = (num: number) => {
    if (num === 1) return; 
    setAllowedInstallments(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num].sort((a,b)=>a-b));
  };

  const handleSaveFinances = async () => {
    const numPrice = parseFloat(editPrice) || 0;
    const numPlazas = parseInt(editPlazas) || 40;
    const numMatricula = parseFloat(matriculaPrice) || 0;
    
    if (hasMatricula && numMatricula >= numPrice) {
      alert("La matrícula no puede ser igual o mayor al precio total del stage.");
      return;
    }

    setSavingFinances(true);
    try {
      const configJson = {
        plazos_permitidos: allowedInstallments.length > 0 ? allowedInstallments : [1],
        tiene_matricula: hasMatricula,
        precio_matricula: hasMatricula ? numMatricula : 0
      };
      
      // GUARDAMOS EN CLUB_STAGES (Precio, Pagos y Plazas)
      const { error } = await supabase.from('club_stages')
        .update({ 
          precio_total: numPrice, 
          plazas_totales: numPlazas, 
          configuracion_pagos: configJson 
        })
        .eq('stage_id', stageId)
        .eq('club_id', clubId);
        
      if (error) throw new Error(error.message);

      setStage((prev: any) => prev ? {...prev, precio_total: numPrice, plazas_totales: numPlazas, configuracion_pagos: configJson} : null);
      setIsFinanceModalOpen(false);
    } catch (e: any) {
      alert(`Hubo un error al guardar: ${e.message}`);
    } finally {
      setSavingFinances(false);
    }
  };

// Función para copiar el enlace de inscripción
  const handleCopyLink = () => {
    // 🔥 CAMBIO CLÍNICO: Apuntamos al gateway público correcto y le pasamos club y stage por parámetros
    const link = `${window.location.origin}/registro?club=${clubId}&stage=${stageId}`;
    navigator.clipboard.writeText(link);
    alert("¡Enlace de inscripción copiado al portapapeles!");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!stage) return <div className="text-center p-20 text-white">Stage no encontrado o no asignado a este club.</div>;

  const currentConfig = getFinanceConfig(stage.configuracion_pagos);
  const plazasOcupadas = inscritos.length;
  const plazasDisponibles = (stage.plazas_totales || 40) - plazasOcupadas;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300 pb-20 max-w-[1600px] mx-auto">
      
      {/* 🚀 HERO HEADER GIGANTE Y ADAPTATIVO */}
      <div className="relative h-auto md:h-[480px] min-h-[400px] rounded-[40px] overflow-hidden group shadow-2xl flex flex-col justify-between">
        <img src={stage.banner_url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent"></div>
        
        {/* Top Header */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start p-8 w-full gap-4">
          <button onClick={() => navigate('/club-dashboard/stages')} className="bg-black/40 backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2">
            <ChevronLeft size={16} /> Volver a Stages
          </button>

          {stage.proveedor_logo && (
            <div className="bg-white p-4 rounded-[24px] shadow-2xl border border-white/20 self-end md:self-auto">
              <img src={stage.proveedor_logo} alt="Proveedor" className="h-12 md:h-20 w-auto object-contain" />
            </div>
          )}
        </div>

        {/* Bottom Content & Botonera */}
        <div className="relative z-10 p-8 md:p-10 flex flex-col xl:flex-row justify-between items-end gap-6 mt-auto">
          <div className="w-full xl:w-auto">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-brand-deep text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <Map size={12} /> Stage Experience
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                <Users size={12} /> {inscritos.length} / {stage.plazas_totales || 40} Plazas
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-none mb-4">{stage.nombre}</h1>
            <div className="flex flex-wrap gap-6 text-slate-300 text-sm font-medium">
              <span className="flex items-center gap-2"><Calendar size={16} className="text-amber-500"/> {stage.fecha_inicio} a {stage.fecha_fin}</span>
              <span className="flex items-center gap-2"><MapPin size={16} className="text-amber-500"/> {stage.lugar}</span>
            </div>
          </div>

          {/* BOTONERA DERECHA: LINK Y FINANZAS */}
          <div className="flex flex-col sm:flex-row items-stretch xl:items-end gap-4 w-full xl:w-auto">
            
            {/* BOTÓN ENLACE INVITACIÓN */}
            <button 
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 border border-blue-500 text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-[24px] hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95"
            >
              <LinkIcon size={16} /> Link Registro
            </button>

            {/* CONFIGURACIÓN FINANCIERA */}
            <div 
              onClick={openFinanceModal}
              className="w-full sm:w-[280px] relative overflow-hidden bg-[#162032]/80 backdrop-blur-md border border-amber-500/50 px-6 py-4 rounded-[24px] text-center xl:text-right cursor-pointer hover:bg-amber-500/10 transition-all group shadow-2xl flex flex-col items-center xl:items-end"
            >
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 group-hover:text-amber-500 transition-colors">
                 Configuración del Club <DollarSign size={12} />
               </p>
               <p className="text-3xl font-display font-black text-white leading-none">
                 {stage.precio_total || 0}<span className="text-base text-slate-500 ml-1">€</span>
               </p>
               <div className="flex gap-2 mt-2 w-full justify-center xl:justify-end">
                 <span className="text-[8px] bg-white/5 text-slate-300 px-2 py-0.5 rounded uppercase tracking-widest font-bold">
                   {currentConfig.plazos.length} Plazos
                 </span>
                 {currentConfig.tieneMatricula && (
                   <span className="text-[8px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded uppercase tracking-widest font-black border border-amber-500/20">
                     + Matrícula
                   </span>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 SISTEMA DE NAVEGACIÓN (TABS) */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'overview', label: 'Dashboard', icon: Activity },
          { id: 'roster', label: 'Inscritos', icon: Users },
          { id: 'itinerary', label: 'Itinerario', icon: Map },
          { id: 'logistics', label: 'Logística & Rooming', icon: Building }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shrink-0 ${
              activeTab === tab.id 
                ? 'bg-amber-500 text-brand-deep shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}

        <div className="ml-auto pl-4 hidden sm:block">
          <button onClick={handleDownloadPdf} disabled={generatingPdf} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shrink-0">
             {generatingPdf ? <Activity className="animate-spin" size={16}/> : <Download size={16} />}
             Exportar Dossier
          </button>
        </div>
      </div>

      {/* 🚀 PANELES DE CONTENIDO */}
      <div className="mt-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="xl:col-span-2 bg-[#162032] border border-white/5 p-8 rounded-[32px] shadow-2xl">
              <h3 className="text-xl font-black text-white italic uppercase mb-4 flex items-center gap-2"><Info className="text-amber-500"/> Información General</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">{stage.descripcion}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Plazas</p>
                  <p className="text-2xl font-black text-white">{stage.plazas_totales || 40}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Ocupadas</p>
                  <p className="text-2xl font-black text-blue-400">{plazasOcupadas}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Días de Stage</p>
                  <p className="text-2xl font-black text-white">{actividades.length}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Disponibles</p>
                  <p className={`text-2xl font-black ${plazasDisponibles <= 5 ? 'text-red-500' : 'text-emerald-500'}`}>{plazasDisponibles}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#162032] border border-amber-500/20 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px]"></div>
              <h3 className="text-lg font-black text-white italic uppercase mb-6">Estado de la Expedición</h3>
              <div className="space-y-4 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0"><CheckCircle2 size={16}/></div>
                  <div>
                    <p className="text-sm font-bold text-white">Lanzamiento de Stage</p>
                    <p className="text-xs text-slate-400">Inscripciones abiertas. Comparte el enlace de la cabecera.</p>
                  </div>
                </div>
                <div className="w-0.5 h-6 bg-white/10 ml-4"></div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0"><Activity size={16}/></div>
                  <div>
                    <p className="text-sm font-bold text-white">Recepción de Pagos</p>
                    <p className="text-xs text-slate-400">En curso. Finanzas configuradas.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROSTER (INSCRITOS) */}
        {activeTab === 'roster' && (
          <div className="bg-[#162032] border border-white/5 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
              <h3 className="text-lg font-black text-white italic uppercase flex items-center gap-2"><Users className="text-blue-400"/> Lista de Viajeros</h3>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{inscritos.length} Confirmados</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-black/40 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-4">Jugador</th>
                    <th className="px-6 py-4 text-center">Posición</th>
                    <th className="px-6 py-4 text-center">Equipo/Categoría</th>
                    <th className="px-6 py-4 text-center">Control Médico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inscritos.map((ins) => (
                    <tr key={ins.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                            {ins.jugadores?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase">{ins.jugadores?.name} {ins.jugadores?.surname}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{ins.jugadores?.dni || "Sin DNI"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-bold text-slate-300 uppercase tracking-wider">{ins.jugadores?.position || "---"}</td>
                      <td className="px-6 py-4 text-center text-xs font-bold text-slate-300 uppercase tracking-wider">{ins.jugadores?.actual_team || "---"}</td>
                      <td className="px-6 py-4 text-center">
                         <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Apto</span>
                      </td>
                    </tr>
                  ))}
                  {inscritos.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">No hay jugadores inscritos aún.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ITINERARIO */}
        {activeTab === 'itinerary' && (
          <div className="bg-[#162032] border border-white/5 p-8 rounded-[32px] shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <StageItinerary dias={actividades} />
          </div>
        )}

        {/* TAB 4: LOGÍSTICA */}
        {activeTab === 'logistics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-[#162032] border border-dashed border-white/20 p-8 rounded-[32px] text-center opacity-70 hover:opacity-100 transition-opacity">
              <Building className="mx-auto text-slate-500 mb-4" size={48} />
              <h3 className="text-xl font-black text-white italic uppercase mb-2">Rooming (Habitaciones)</h3>
              <p className="text-slate-400 text-sm mb-6">Asigna a los {inscritos.length} jugadores en habitaciones dobles o triples automáticamente.</p>
              <button className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-widest border border-white/10">Activar Módulo</button>
            </div>
            
            <div className="bg-[#162032] border border-dashed border-white/20 p-8 rounded-[32px] text-center opacity-70 hover:opacity-100 transition-opacity">
              <Plane className="mx-auto text-slate-500 mb-4" size={48} />
              <h3 className="text-xl font-black text-white italic uppercase mb-2">Transporte</h3>
              <p className="text-slate-400 text-sm mb-6">Gestiona billetes de avión, puntos de encuentro y asientos en el autobús.</p>
              <button className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-widest border border-white/10">Activar Módulo</button>
            </div>
          </div>
        )}

      </div>

      {/* ==================================================== */}
      {/* 🚀 MODAL DE CONFIGURACIÓN DEL CLUB (Finanzas y Plazas) */}
      {/* ==================================================== */}
      {isFinanceModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsFinanceModalOpen(false)} />
           <div className="relative bg-[#162032] border border-amber-500/20 w-full max-w-lg rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.1)] animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-xl md:text-2xl font-display font-black text-white uppercase italic tracking-tighter">Ajustes del Stage</h3>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configuración específica para el club</p>
                 </div>
                 <button onClick={() => setIsFinanceModalOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 md:p-0"><X size={20} className="md:w-6 md:h-6"/></button>
              </div>

              <div className="space-y-5 md:space-y-6">
                 
                 {/* PLAZAS */}
                 <div>
                    <label className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest">1. Plazas Ofrecidas</label>
                    <div className="relative mt-2">
                       <input 
                         type="number" 
                         className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-3 md:py-4 text-white font-display font-black text-xl md:text-2xl focus:border-blue-400 outline-none"
                         value={editPlazas}
                         onChange={(e) => setEditPlazas(e.target.value)}
                       />
                       <span className="absolute right-4 md:right-6 top-4 md:top-5 text-slate-500 font-bold text-sm md:text-base">JUGADORES</span>
                    </div>
                 </div>

                 {/* PRECIO */}
                 <div className="pt-5 md:pt-6 border-t border-white/5">
                    <label className="text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest">2. Precio Total del Stage</label>
                    <div className="relative mt-2">
                       <input 
                         type="number" 
                         className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-3 md:py-4 text-white font-display font-black text-xl md:text-2xl focus:border-amber-500 outline-none"
                         value={editPrice}
                         onChange={(e) => setEditPrice(e.target.value)}
                       />
                       <span className="absolute right-4 md:right-6 top-4 md:top-5 text-slate-500 font-bold text-sm md:text-base">EUR</span>
                    </div>
                 </div>

                 {/* MATRICULA */}
                 <div className="pt-5 md:pt-6 border-t border-white/5">
                    <label className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">3. Matrícula Inicial (Reserva)</label>
                    <p className="text-[10px] md:text-xs text-slate-500 mb-3 mt-1 leading-relaxed">Permite cobrar un pago inmediato para formalizar la reserva.</p>
                    
                    <label className="flex items-center gap-3 cursor-pointer p-3 md:p-4 rounded-xl border border-white/5 bg-[#0D1B2A] hover:bg-white/5 transition-colors mb-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 md:w-5 md:h-5 rounded border-white/10 bg-black text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                        checked={hasMatricula}
                        onChange={(e) => setHasMatricula(e.target.checked)}
                      />
                      <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">Requerir Señal de Reserva</span>
                    </label>

                    {hasMatricula && (
                      <div className="relative animate-in slide-in-from-top-2">
                         <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-500 font-bold text-xs md:text-base">Importe:</span>
                         </div>
                         <input 
                           type="number" 
                           className="w-full bg-[#162032] border border-emerald-500/30 rounded-xl pl-16 md:pl-20 pr-10 md:pr-12 py-2.5 md:py-3 text-white font-black text-base md:text-lg focus:border-emerald-400 outline-none"
                           placeholder="100"
                           value={matriculaPrice}
                           onChange={(e) => setMatriculaPrice(e.target.value)}
                         />
                         <span className="absolute right-3 md:right-4 top-3 md:top-3 text-slate-500 font-bold text-sm md:text-base">€</span>
                      </div>
                    )}
                 </div>

                 {/* PLAZOS */}
                 <div className="pt-5 md:pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest">4. Opciones de Plazos (Cuotas)</label>
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-500 mb-3 md:mb-4 mt-1 leading-relaxed">
                      {hasMatricula 
                        ? `Las cuotas se calcularán sobre el restante (${(parseFloat(editPrice) || 0) - (parseFloat(matriculaPrice) || 0)}€).`
                        : "Selecciona en cuántos plazos permites que dividan el pago."}
                    </p>
                    
                    <div className="grid grid-cols-5 gap-2">
                       {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                          const isActive = allowedInstallments.includes(num);
                          return (
                             <button
                               key={num}
                               onClick={() => toggleInstallment(num)}
                               disabled={num === 1}
                               className={`py-2 md:py-3 rounded-lg md:rounded-xl font-black text-base md:text-lg transition-all ${
                                 isActive 
                                 ? 'bg-amber-500 text-brand-deep border border-amber-500 shadow-lg scale-105' 
                                 : 'bg-[#0D1B2A] text-slate-500 border border-white/5 hover:border-white/20'
                               } ${num === 1 ? 'opacity-80 cursor-not-allowed' : ''}`}
                             >
                               {num}
                             </button>
                          );
                       })}
                    </div>
                 </div>

                 <button 
                   onClick={handleSaveFinances}
                   disabled={savingFinances}
                   className="w-full py-3 md:py-4 mt-2 md:mt-4 bg-amber-500 text-brand-deep font-black uppercase text-[10px] md:text-xs tracking-widest rounded-xl md:rounded-2xl hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-amber-500/20"
                 >
                   {savingFinances ? <Loader2 size={16} className="animate-spin md:w-[18px] md:h-[18px]" /> : <><Save size={16} className="md:w-[18px] md:h-[18px]" /> Guardar Ajustes del Stage</>}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}