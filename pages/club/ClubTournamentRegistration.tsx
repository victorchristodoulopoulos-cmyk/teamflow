import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { Send, Building2, Phone, CheckCircle2, User, HelpCircle, Trophy } from "lucide-react";

export default function ClubTournamentRegistration() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [torneo, setTorneo] = useState<any>(null);
  const [perfilClub, setPerfilClub] = useState<any>(null);
  const [categoriasList, setCategoriasList] = useState<string[]>([]);
  const [yaInscrito, setYaInscrito] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre_responsable: "",
    telefono: "",
    categorias: [] as string[],
    info_adicional: "",
    como_nos_conociste: "",
    terminos_aceptados: false
  });

  const comoConocisteList = ["Redes Sociales", "Email", "Amigos", "Otro"];

  useEffect(() => {
    cargarDatos();
  }, [torneoId]);

  const cargarDatos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Si no hay usuario, mandamos al login
        navigate(`/login/club?redirect=/club-dashboard/torneos/${torneoId}/registro`);
        return;
      }

      // 1. Datos del Torneo y Categorías
      const [resTorneo, resCats, resInscripcion] = await Promise.all([
        supabase.from("torneos").select("*").eq("id", torneoId).single(),
        supabase.from("categorias_torneo").select("nombre").eq("torneo_id", torneoId).order("nombre"),
        supabase.from("inscripciones_torneo").select("id").eq("torneo_id", torneoId).eq("club_id", user.id).maybeSingle()
      ]);

      if (resInscripcion.data) {
        setYaInscrito(true); // Ya estaba inscrito
        setLoading(false);
        return;
      }

      setTorneo(resTorneo.data);
      if (resCats.data) setCategoriasList(resCats.data.map((c: any) => c.nombre));

      // 2. Datos del Club (Perfil)
      const { data: perfil } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setPerfilClub(perfil);
      
      // Pre-rellenamos datos conocidos
      setFormData(prev => ({
        ...prev,
        telefono: perfil?.telefono || "",
        nombre_responsable: perfil?.nombre_responsable || "" 
      }));

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categorias.length === 0) return alert("Selecciona categorías.");
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    // 🔥 LA INSCRIPCIÓN VINCULADA
    const { error } = await supabase.from("inscripciones_torneo").insert([{
      torneo_id: torneoId,
      club_id: user?.id, // 🔗 VINCULACIÓN CLAVE
      es_club_teamflow: true,
      nombre_club: perfilClub?.nombre_club || "Club TeamFlow", // Nombre oficial del perfil
      email_responsable: user?.email, // Email oficial de la cuenta
      nombre_responsable: formData.nombre_responsable,
      telefono: formData.telefono,
      categorias: formData.categorias,
      info_adicional: formData.info_adicional,
      como_nos_conociste: formData.como_nos_conociste,
      terminos_aceptados: formData.terminos_aceptados,
      importe_inscripcion: 0, // Se calculará luego
      estado: 'pendiente'
    }]);

    if (!error) {
      // Redirigimos al detalle del torneo dentro del dashboard
      navigate(`/club-dashboard/torneos/${torneoId}`);
    } else {
      alert("Error al inscribirse: " + error.message);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-10 text-center text-white">Cargando...</div>;

  if (yaInscrito) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-[#1e293b] p-8 rounded-[32px] text-center max-w-md border border-white/10">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white italic uppercase">¡Ya estás inscrito!</h2>
          <p className="text-slate-400 mt-2 mb-6">Tu club ya tiene una ficha activa en este torneo.</p>
          <button onClick={() => navigate(`/club-dashboard/torneos/${torneoId}`)} className="bg-amber-500 text-brand-deep px-6 py-3 rounded-xl font-bold uppercase w-full">
            Ir al Panel del Torneo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/30">
            <Trophy size={32} />
          </div>
          <div>
            <p className="text-amber-500 text-xs font-black uppercase tracking-widest mb-1">Inscripción Oficial (TeamFlow)</p>
            <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase">{torneo?.name}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* DATOS PRE-RELLENADOS (SOLO LECTURA PARA DAR CONFIANZA) */}
            <div className="space-y-4 opacity-70 pointer-events-none">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Tu Club (Vinculado)</label>
                <div className="flex items-center gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                  <Building2 className="text-blue-400" size={20} />
                  <span className="text-white font-bold">{perfilClub?.nombre_club || "Mi Club"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Email de Gestión</label>
                <div className="flex items-center gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                  <Send className="text-blue-400" size={20} />
                  <span className="text-white font-bold">{perfilClub?.email || "usuario@teamflow.com"}</span>
                </div>
              </div>
            </div>

            {/* DATOS A RELLENAR */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Responsable del Equipo *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-500/50" placeholder="Nombre completo" value={formData.nombre_responsable} onChange={e => setFormData({...formData, nombre_responsable: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Teléfono de Contacto *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-500/50" placeholder="+34 600..." value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          {/* SELECCIÓN DE CATEGORÍAS */}
          <div className="border-t border-white/10 pt-8 mb-8">
            <h3 className="text-lg font-black text-white italic uppercase mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" /> Categorías a Participar
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categoriasList.map(cat => {
                const isSelected = formData.categorias.includes(cat);
                return (
                  <button 
                    key={cat} type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, categorias: isSelected ? prev.categorias.filter(x => x !== cat) : [...prev.categorias, cat] }))} 
                    className={`py-3 px-2 rounded-xl text-xs font-black border transition-all ${isSelected ? 'bg-amber-500 border-amber-500 text-brand-deep' : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* CHECKBOXES Y INFO EXTRA */}
          <div className="space-y-6 mb-8">
            <textarea 
              rows={3} 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-amber-500/50 resize-none text-sm" 
              placeholder="Comentarios adicionales para la organización (número de equipos, peticiones de horarios...)"
              onChange={e => setFormData({...formData, info_adicional: e.target.value})}
            />
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" required className="w-5 h-5 accent-amber-500" checked={formData.terminos_aceptados} onChange={e => setFormData({...formData, terminos_aceptados: e.target.checked})} />
              <span className="text-sm text-slate-300">Acepto el reglamento del torneo y la política de privacidad.</span>
            </label>
          </div>

          <button disabled={submitting} type="submit" className="w-full bg-amber-500 text-brand-deep font-black py-5 rounded-xl uppercase tracking-widest text-sm hover:bg-amber-400 transition-all shadow-lg flex items-center justify-center gap-2">
            {submitting ? "Procesando..." : <><CheckCircle2 size={20} /> Confirmar Inscripción</>}
          </button>

        </form>
      </div>
    </div>
  );
}