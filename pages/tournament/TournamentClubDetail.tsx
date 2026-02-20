import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { 
  ArrowLeft, Building2, Mail, Phone, Clock, CheckCircle2, 
  Link as LinkIcon, Users, Trophy, Wallet, Activity, ShieldCheck, BedDouble, MapPin
} from "lucide-react";

export default function TournamentClubDetail() {
  const { inscripcionId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState<any>(null);
  const [hoteles, setHoteles] = useState<any[]>([]); 
  const [categoriasOficiales, setCategoriasOficiales] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Estado para la selección
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClubDetails();
  }, [inscripcionId]);

  const fetchClubDetails = async () => {
    // 1. Cargar Club
    const { data: clubData, error: clubError } = await supabase
      .from("inscripciones_torneo")
      .select("*")
      .eq("id", inscripcionId)
      .single();
      
    if (clubData) {
      if (!clubData.categorias_confirmadas) clubData.categorias_confirmadas = [];
      setClub(clubData);
      setSelectedCats(clubData.categorias_confirmadas);

      // 2. Cargar Hoteles del Torneo
      const { data: hotelesData } = await supabase
        .from("hoteles")
        .select("*")
        .eq("torneo_id", clubData.torneo_id);
      
      if (hotelesData) setHoteles(hotelesData);

      // 3. 🔥 Cargar TODAS las categorías oficiales de este torneo para mostrarlas
      const { data: catData } = await supabase
        .from("categorias_torneo")
        .select("nombre")
        .eq("torneo_id", clubData.torneo_id)
        .order("nombre");

      if (catData) {
        setCategoriasOficiales(catData.map(c => c.nombre));
      }
    }
    if (clubError) console.error("Error al cargar la biblia del club:", clubError);
    setLoading(false);
  };

  const handleToggleCategory = (categoria: string) => {
    if (!club) return;
    setSelectedCats(prev => 
      prev.includes(categoria) 
        ? prev.filter(c => c !== categoria) 
        : [...prev, categoria]
    );
  };

  const handleConfirmCategories = async () => {
    if (!club) return;
    setSaving(true);

    const { error } = await supabase
      .from("inscripciones_torneo")
      .update({ 
        categorias_confirmadas: selectedCats, 
        estado: selectedCats.length > 0 ? 'aceptada' : 'pendiente' 
      })
      .eq("id", club.id);

    if (!error) {
      setClub({ ...club, categorias_confirmadas: selectedCats, estado: selectedCats.length > 0 ? 'aceptada' : 'pendiente' });
      const msg = selectedCats.length > 0 
        ? "¡Cambios guardados! Equipos confirmados oficialmente." 
        : "Equipos desconfirmados. El club vuelve a estar pendiente.";
      alert(msg);
    } else {
      alert("Error al conectar con la base de datos.");
    }
    setSaving(false);
  };

  const handleAssignHotel = async (hotelId: string) => {
    if (!club) return;
    const newHotelId = club.hotel_id === hotelId ? null : hotelId;
    setClub({ ...club, hotel_id: newHotelId });
    await supabase.from("inscripciones_torneo").update({ hotel_id: newHotelId }).eq("id", club.id);
  };

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/activar-club?invite=${club.invite_token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!club) return <div className="text-white">Club no encontrado</div>;

  const linkActivo = club.club_linked_id != null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-amber-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors">
        <ArrowLeft size={16} /> Volver a Clubes
      </button>

      <div className="relative overflow-hidden rounded-[40px] border border-white/5 bg-[#162032] p-8 md:p-10 shadow-2xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
            <Building2 size={32} className="md:w-10 md:h-10" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{club.nombre_club}</h1>
              {linkActivo ? (
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-black uppercase border border-green-500/20 flex items-center gap-1">
                  <ShieldCheck size={12} /> Cuenta Vinculada
                </span>
              ) : (
                <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase border border-orange-500/20 flex items-center gap-1">
                  <Clock size={12} /> Pendiente de Registro
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-amber-500" /> {club.email_responsable}</span>
              <span className="flex items-center gap-1.5"><Phone size={14} className="text-amber-500" /> {club.telefono}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-black/30 p-5 rounded-3xl border border-white/5 w-full xl:w-auto xl:min-w-[300px]">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Activity size={14} /> Acceso a la Plataforma
          </p>
          {linkActivo ? (
            <div className="text-sm text-slate-300">El club ya está operando en la plataforma.</div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">Manda este enlace al responsable para que configure su cuenta y empiece a cobrar a los padres.</p>
              <button 
                onClick={handleCopyInviteLink}
                className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${
                  copied ? "bg-green-500 text-brand-deep" : "bg-white/10 text-white hover:bg-white/20 border border-white/5"
                }`}
              >
                {copied ? <CheckCircle2 size={16} /> : <LinkIcon size={16} />}
                {copied ? "Enlace Copiado" : "Copiar Invitación Mágica"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-2 space-y-8">
          
          <div className="bg-[#162032]/60 border border-white/5 rounded-[32px] p-6 md:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between mb-8 border-b border-white/5 pb-6 gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white italic uppercase flex items-center gap-3">
                  <Trophy className="text-amber-500" /> Equipos del Club
                </h2>
                <p className="text-slate-400 text-xs md:text-sm mt-1">
                  Activa los equipos oficiales y pulsa confirmar.
                </p>
              </div>
              
              <button 
                onClick={handleConfirmCategories}
                disabled={saving}
                className="bg-amber-500 text-brand-deep px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-white transition-all shadow-lg"
              >
                {saving ? <div className="w-4 h-4 border-2 border-brand-deep border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
                Guardar Cambios
              </button>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                Asignación de Categorías
              </h3>
              
              {categoriasOficiales.length === 0 ? (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-500 text-sm">
                  El torneo no tiene categorías creadas. Ve al panel de Categorías.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  {categoriasOficiales.map((cat: string) => {
                    const isSelected = selectedCats.includes(cat);
                    const isSavedInDB = club.categorias_confirmadas?.includes(cat);
                    const fueSolicitado = club.categorias?.includes(cat); // 🔥 Vemos si el club lo pidió originalmente
                    
                    return (
                      <button
                        key={cat}
                        onClick={() => handleToggleCategory(cat)}
                        className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group ${
                          isSelected && isSavedInDB
                            ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)]' 
                            : isSelected 
                              ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                              : 'bg-black/40 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {/* Indicador de si el club lo solicitó */}
                        {fueSolicitado && !isSelected && (
                          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-orange-500" title="El club solicitó esta categoría" />
                        )}

                        <div className={`absolute top-2 right-2 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected && isSavedInDB ? 'border-green-500 bg-green-500 text-brand-deep' 
                          : isSelected ? 'border-amber-500 bg-amber-500 text-brand-deep' 
                          : 'border-slate-600'
                        }`}>
                          {isSelected && <CheckCircle2 size={10} strokeWidth={4} />}
                        </div>
                        
                        <span className={`text-lg md:text-xl font-black italic transition-colors ${
                          isSelected && isSavedInDB ? 'text-green-500' 
                          : isSelected ? 'text-amber-500' 
                          : 'text-slate-500 group-hover:text-white'
                        }`}>{cat}</span>
                        
                        <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${
                          isSelected && isSavedInDB ? 'text-green-500' 
                          : isSelected ? 'text-amber-500' 
                          : 'text-slate-500'
                        }`}>
                          {isSelected && isSavedInDB ? 'Confirmado' : isSelected ? 'Sin guardar' : (fueSolicitado ? 'Solicitado' : 'Inactivo')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#162032]/60 border border-white/5 rounded-[32px] p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white italic uppercase flex items-center gap-3">
                  <BedDouble className="text-blue-400" /> Alojamiento Asignado
                </h2>
                <p className="text-slate-400 text-xs md:text-sm mt-1">Selecciona en qué hotel o residencia se hospedará esta expedición.</p>
              </div>
            </div>

            {hoteles.length === 0 ? (
              <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center">
                <MapPin className="mx-auto text-blue-500/50 mb-2" size={24} />
                <p className="text-sm text-blue-400 font-bold mb-1">No tienes hoteles creados</p>
                <p className="text-xs text-slate-400">Ve a la pestaña "Alojamientos" del menú lateral para añadir el stock de hoteles de tu torneo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hoteles.map((hotel) => {
                  const isSelected = club.hotel_id === hotel.id; 
                  return (
                    <button
                      key={hotel.id}
                      onClick={() => handleAssignHotel(hotel.id)}
                      className={`relative flex items-center gap-4 p-4 rounded-2xl border text-left transition-all group ${
                        isSelected
                          ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                          : 'bg-black/40 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500 group-hover:text-blue-400'}`}>
                        <MapPin size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold uppercase truncate ${isSelected ? 'text-blue-400' : 'text-white'}`}>{hotel.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{hotel.precio_noche}€ / noche</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-600'}`}>
                        {isSelected && <CheckCircle2 size={12} strokeWidth={4} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#162032]/60 border border-white/5 rounded-[32px] p-6 md:p-8 shadow-2xl">
            <h2 className="text-lg md:text-xl font-black text-white italic uppercase flex items-center gap-3 mb-4">
              Peticiones Especiales (Comentarios)
            </h2>
            <div className="bg-black/30 border border-white/5 p-6 rounded-2xl text-slate-300 text-sm leading-relaxed">
              {club.info_adicional || "El club no ha dejado notas adicionales."}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-[#162032] to-[#0D1B2A] border border-amber-500/20 rounded-[32px] p-6 md:p-8 shadow-[0_0_40px_rgba(245,158,11,0.05)]">
            <h2 className="text-lg md:text-xl font-black text-white italic uppercase flex items-center gap-3 mb-6">
              <Wallet className="text-amber-500" /> Resumen Financiero
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fee de Inscripción Estimado</p>
                <p className="text-2xl md:text-3xl font-black text-white italic">{club.importe_inscripcion || 0}€</p>
              </div>

              <div className="h-px w-full bg-white/5"></div>

              <div className="opacity-50">
                <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Recaudación Familias</p>
                <p className="text-xl font-black text-slate-400 italic">-- €</p>
                <p className="text-[10px] md:text-xs text-slate-500 mt-2">Los datos se activarán cuando el club vincule su cuenta y los padres paguen.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#162032]/60 border border-white/5 rounded-[32px] p-6 md:p-8 shadow-2xl">
            <h2 className="text-lg md:text-xl font-black text-white italic uppercase flex items-center gap-3 mb-6">
              <Users className="text-slate-400" /> Plantillas
            </h2>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-600 mb-4">
                <Users size={24} />
              </div>
              <p className="text-xs md:text-sm text-slate-400">Aún no se han importado los jugadores de este club.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}