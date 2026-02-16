import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { Send, Mail, Building2, Phone, CheckCircle2, User, HelpCircle, AlertCircle } from "lucide-react";

// Función auxiliar para la foto del banner
const getBannerUrl = (path: string | null) => {
  if (!path) return "https://images.unsplash.com/photo-1518605368461-1e12d1b8004b?auto=format&fit=crop&w=2500&q=80";
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('torneos-banners').getPublicUrl(path);
  return data.publicUrl;
};

export default function PublicTournamentRegistration() {
  const { torneoId } = useParams();
  
  const [torneoNombre, setTorneoNombre] = useState<string>("");
  const [torneoBanner, setTorneoBanner] = useState<string | null>(null);
  const [loadingTorneo, setLoadingTorneo] = useState(true);
  const [torneoError, setTorneoError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [otroConocimiento, setOtroConocimiento] = useState("");

  const [formData, setFormData] = useState({
    nombre_club: "",
    nombre_responsable: "",
    email_responsable: "",
    telefono: "",
    categorias: [] as string[],
    info_adicional: "",
    como_nos_conociste: "",
    terminos_aceptados: false
  });

  const categoriasList = [
    "B8 (2018-2019)", "B9 (2017)", "B10 (2016)", "B11 (2015)", 
    "B12 (2014)", "B13 (2013)", "B14 (2012)", "B15 (2011)", 
    "B16 (2010)", "B19 (2007-2009)", "G12 (2014-2015)", 
    "G14 (2012-2013)", "G16 (2010-2011)", "G19 (2007-2009)"
  ];

  const comoConocisteList = [
    "Hemos participado otros años", "A través de conocidos", "Buscando por internet",
    "Instagram", "Recibí un email con la invitación", "Me llamaron por teléfono",
    "Me contactaron por LinkedIn", "Agente Oficial"
  ];

  useEffect(() => {
    const fetchTorneo = async () => {
      if (!torneoId || torneoId.length < 30) {
         setTorneoError(true);
         setLoadingTorneo(false);
         return;
      }

      try {
        const { data, error } = await supabase
          .from("torneos")
          .select("name, banner_path")
          .eq("id", torneoId)
          .single();

        if (error || !data) {
          console.error("Error cargando torneo:", error);
          setTorneoError(true);
        } else {
          setTorneoNombre(data.name);
          setTorneoBanner(data.banner_path);
        }
      } catch (err) {
        setTorneoError(true);
      } finally {
        setLoadingTorneo(false);
      }
    };

    fetchTorneo();
  }, [torneoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categorias.length === 0) return alert("Selecciona al menos una categoría.");
    if (!formData.terminos_aceptados) return alert("Debes aceptar los términos y condiciones.");

    setLoading(true);
    
    const origenFinal = formData.como_nos_conociste === "Otro" ? `Otro: ${otroConocimiento}` : formData.como_nos_conociste;

    const { error } = await supabase.from("inscripciones_torneo").insert([{
      torneo_id: torneoId, 
      nombre_club: formData.nombre_club,
      nombre_responsable: formData.nombre_responsable,
      email_responsable: formData.email_responsable,
      telefono: formData.telefono,
      categorias: formData.categorias,
      info_adicional: formData.info_adicional,
      como_nos_conociste: origenFinal,
      terminos_aceptados: formData.terminos_aceptados,
      importe_inscripcion: formData.categorias.length * 150
    }]);

    if (!error) {
      setSuccess(true);
    } else {
      alert("Hubo un error al enviar. Inténtalo de nuevo.");
      console.error(error);
    }
    setLoading(false);
  };

  if (loadingTorneo) {
    return (
      <div className="min-h-screen bg-brand-deep flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (torneoError) {
    return (
      <div className="min-h-screen bg-brand-deep flex items-center justify-center p-6 text-center">
        <div className="bg-[#162032] border border-red-500/20 p-12 rounded-[40px] max-w-lg">
          <AlertCircle className="text-red-500 w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white uppercase italic mb-4">Link Inválido</h2>
          <p className="text-slate-400">No hemos podido encontrar este torneo. Asegúrate de que el enlace proporcionado por la organización es correcto.</p>
        </div>
      </div>
    );
  }

  if (success) return (
    <div className="min-h-screen bg-brand-deep flex items-center justify-center p-6 text-center">
      <div className="bg-[#162032] border border-white/10 p-12 rounded-[40px] shadow-2xl animate-in zoom-in max-w-lg">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
          <CheckCircle2 className="text-green-500 w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">¡Inscripción Enviada!</h2>
        <p className="text-slate-400 text-lg leading-relaxed mb-8">
          El comité organizador de <strong className="text-white">{torneoNombre}</strong> revisará tu solicitud. En breve recibirás un email con los siguientes pasos.
        </p>
        <button onClick={() => window.location.reload()} className="text-amber-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors">
          Enviar otra solicitud
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-app bg-noise">
      
      {/* 📸 BANNER TIPO GOOGLE FORMS DINÁMICO (SIN LOGO DE TEAMFLOW) */}
      <div className="w-full h-[35vh] md:h-[45vh] relative">
        <img 
          src={getBannerUrl(torneoBanner)} 
          className="w-full h-full object-cover" 
          alt={`Banner de ${torneoNombre}`} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-transparent to-black/40"></div>
      </div>

      {/* 📝 FORMULARIO SOLAPADO */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 -mt-24 sm:-mt-40 pb-24">
        
        <form onSubmit={handleSubmit} className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] rounded-[32px] overflow-hidden">
          <div className="h-4 bg-amber-500 w-full"></div>
          
          <div className="bg-[#162032] border-x border-b border-white/10 p-8 sm:p-12 backdrop-blur-xl">
            
            <header className="mb-10 border-b border-white/5 pb-8">
              <h1 className="text-4xl sm:text-5xl font-black italic text-white uppercase tracking-tighter mb-3">
                INSCRIPCIÓN <span className="text-amber-500">{torneoNombre}</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Formulario de inscripción oficial para participar. Por favor, completa todos los campos requeridos con asterisco (*).
              </p>
            </header>

            <div className="space-y-8">
              
              {/* --- DATOS PRINCIPALES --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest ml-2">Nombre del Club <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                    <input required className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-500/50 transition-all" placeholder="Ej: FC Barcelona" onChange={e => setFormData({...formData, nombre_club: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest ml-2">Nombre Responsable <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                    <input required className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-500/50 transition-all" placeholder="Nombre y Apellidos" onChange={e => setFormData({...formData, nombre_responsable: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest ml-2">Correo Electrónico <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                    <input required type="email" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-500/50 transition-all" placeholder="correo@club.com" onChange={e => setFormData({...formData, email_responsable: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest ml-2">Teléfono <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                    <input required className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-500/50 transition-all" placeholder="+34 600..." onChange={e => setFormData({...formData, telefono: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* --- CATEGORÍAS --- */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black uppercase text-amber-500 ml-2 tracking-widest flex items-center gap-2">
                  Categoría/s a Inscribir <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categoriasList.map(c => {
                    const isSelected = formData.categorias.includes(c);
                    return (
                      <button 
                        key={c} type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, categorias: isSelected ? prev.categorias.filter(x => x !== c) : [...prev.categorias, c] }))} 
                        className={`py-3 px-2 rounded-xl text-xs font-black border transition-all duration-300 ${
                          isSelected 
                            ? 'bg-amber-500 border-amber-500 text-brand-deep shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02]' 
                            : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* --- INFO ADICIONAL --- */}
              <div className="space-y-2 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest ml-2">
                  Info Adicional Equipos <span className="text-slate-500 normal-case font-medium italic">(nº equipos, nivel, peticiones...)</span> <span className="text-red-500">*</span>
                </label>
                <textarea 
                  required
                  rows={4} 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-amber-500/50 transition-all resize-none" 
                  placeholder="Escribe aquí tus comentarios..." 
                  onChange={e => setFormData({...formData, info_adicional: e.target.value})} 
                />
              </div>

              {/* --- CÓMO NOS HA CONOCIDO --- */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest ml-2 flex items-center gap-2">
                  <HelpCircle size={14} /> ¿Cómo nos ha conocido? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-2">
                  {comoConocisteList.map(opcion => (
                    <label key={opcion} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formData.como_nos_conociste === opcion ? 'border-amber-500' : 'border-white/20 group-hover:border-amber-500/50'}`}>
                        {formData.como_nos_conociste === opcion && <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />}
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{opcion}</span>
                      <input type="radio" name="conocido" value={opcion} className="hidden" onChange={(e) => setFormData({...formData, como_nos_conociste: e.target.value})} />
                    </label>
                  ))}
                  
                  {/* Opción OTRO */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${formData.como_nos_conociste === "Otro" ? 'border-amber-500' : 'border-white/20 group-hover:border-amber-500/50'}`}>
                      {formData.como_nos_conociste === "Otro" && <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />}
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Otro:</span>
                    <input type="radio" name="conocido" value="Otro" className="hidden" onChange={() => setFormData({...formData, como_nos_conociste: "Otro"})} />
                    {formData.como_nos_conociste === "Otro" && (
                      <input type="text" className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-amber-500/50 w-full max-w-[200px]" placeholder="Especifique..." onChange={(e) => setOtroConocimiento(e.target.value)} />
                    )}
                  </label>
                </div>
              </div>

              {/* --- TÉRMINOS Y CONDICIONES --- */}
              <div className="pt-8 border-t border-white/5">
                <label className="flex items-start gap-4 cursor-pointer group p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                  <div className={`mt-0.5 w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-all ${formData.terminos_aceptados ? 'bg-amber-500 border-amber-500 text-brand-deep' : 'bg-black/50 border-white/20 group-hover:border-amber-500/50'}`}>
                    {formData.terminos_aceptados && <CheckCircle2 size={16} />}
                  </div>
                  <div>
                    <span className="text-sm text-white font-bold block mb-1">Términos y Condiciones <span className="text-red-500">*</span></span>
                    <span className="text-xs text-slate-400">He leído y estoy de acuerdo con los Términos y condiciones y el Reglamento del Torneo.</span>
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.terminos_aceptados} onChange={(e) => setFormData({...formData, terminos_aceptados: e.target.checked})} />
                </label>
              </div>

              {/* --- BOTÓN SUBMIT --- */}
              <button disabled={loading} type="submit" className="w-full bg-amber-500 text-brand-deep font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-sm mt-4 hover:bg-amber-400 transition-all shadow-[0_0_40px_rgba(245,158,11,0.2)] flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]">
                {loading ? <div className="w-6 h-6 border-2 border-brand-deep border-t-transparent rounded-full animate-spin" /> : <><Send size={20} /> Enviar Inscripción</>}
              </button>
              <p className="text-center text-[10px] text-slate-500 mt-4">
                Se enviará una copia de tus respuestas por correo electrónico a la dirección proporcionada.
              </p>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}