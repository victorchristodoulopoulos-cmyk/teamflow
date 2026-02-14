import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTeam } from "../../context/TeamContext";
import { getTeamLogistics } from "../../supabase/logisticsService";
import { supabase } from "../../supabase/supabaseClient";
import { 
  Hotel, Bus, Plane, MapPin, Calendar, Clock, 
  Navigation, Phone, Map, Shield, Loader2, ArrowRight,
  CheckCircle2, AlertCircle, Info
} from "lucide-react";

// --- HELPER PARA IMÁGENES DE HOTEL ---
const getImageUrl = (path: string | null) => {
  if (!path) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000"; // Imagen por defecto espectacular
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('hoteles').getPublicUrl(path);
  return data.publicUrl;
};

export default function TeamLogistics() {
  const { activeTeam, loading: teamLoading } = useTeam();

  const { data: logistics, isLoading } = useQuery({
    queryKey: ["team-logistics", activeTeam?.id],
    queryFn: () => activeTeam?.torneo_id 
      ? getTeamLogistics(activeTeam.id, activeTeam.torneo_id)
      : Promise.resolve({ hotel: null, transport: null }),
    enabled: !!activeTeam?.id && !!activeTeam?.torneo_id,
  });

  if (teamLoading || isLoading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-center">
        <Loader2 className="animate-spin text-brand-neon mb-4" size={40} />
        <span className="text-brand-neon font-black uppercase tracking-widest animate-pulse">Sincronizando Logística...</span>
      </div>
    );
  }

  if (!activeTeam) return <div className="p-10 text-white">No hay equipo seleccionado.</div>;

  const { hotel, transport } = logistics || { hotel: null, transport: null };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 🚀 HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-2 text-purple-400">
              <Shield size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{activeTeam.name}</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
             Hoja de Ruta
           </h1>
           <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">
             Toda la información de alojamiento y desplazamientos
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        
        {/* ==========================================
            🏨 MÓDULO ALOJAMIENTO (CUARTEL GENERAL)
            ========================================== */}
        <div className="flex flex-col h-full">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Cuartel General
          </h2>
          
          {hotel ? (
            <div className="bg-[#162032]/60 border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl group hover:border-blue-500/30 transition-all flex-1 backdrop-blur-md">
              
              {/* Cover Image & Status */}
              <div className="h-48 md:h-56 relative overflow-hidden bg-black">
                <img 
                  src={getImageUrl(hotel.image_path)} 
                  alt="Hotel" 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#162032] via-transparent to-transparent"></div>
                
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                    <Hotel size={12} /> Confirmado
                  </div>
                  {hotel.estrellas && (
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 text-yellow-400 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest flex items-center shadow-lg">
                      {hotel.estrellas} ⭐
                    </div>
                  )}
                </div>
              </div>

              {/* Data Content */}
              <div className="p-6 md:p-8 flex flex-col flex-1 relative z-10 -mt-6">
                <h3 className="text-2xl md:text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-none mb-2">
                  {hotel.name}
                </h3>
                <p className="text-slate-400 text-sm font-bold flex items-center gap-1.5 mb-6">
                  <MapPin size={16} className="text-blue-500 shrink-0" /> 
                  <span className="truncate">{hotel.address || hotel.ciudad || "Dirección pendiente"}</span>
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-white/5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={10}/> Check-In</p>
                    <p className="text-sm font-black text-white">{hotel.check_in ? new Date(hotel.check_in).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBC'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0D1B2A] border border-white/5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={10}/> Check-Out</p>
                    <p className="text-sm font-black text-white">{hotel.check_out ? new Date(hotel.check_out).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBC'}</p>
                  </div>
                </div>

                <div className="mt-auto space-y-3 pt-6 border-t border-white/5">
                  {hotel.contacto && (
                    <div className="flex items-center gap-3 text-sm text-slate-300 font-bold bg-white/5 p-3 rounded-xl">
                      <Phone size={16} className="text-blue-500" /> Recepción: {hotel.contacto}
                    </div>
                  )}
                  {hotel.google_maps_url && (
                    <a href={hotel.google_maps_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      <Map size={16} /> Abrir en Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[32px] bg-[#162032]/20 p-10 text-center">
               <Hotel size={48} className="text-slate-600 mb-4 opacity-50" />
               <p className="text-lg font-black text-white uppercase italic tracking-tighter">Alojamiento Pendiente</p>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">La organización está gestionando el hotel.</p>
            </div>
          )}
        </div>

        {/* ==========================================
            🚌 MÓDULO TRANSPORTE (PLAN DE VUELO)
            ========================================== */}
        <div className="flex flex-col h-full">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-neon"></span> Plan de Desplazamiento
          </h2>

          {transport ? (
            <div className="bg-[#162032]/60 border border-brand-neon/20 rounded-[32px] p-6 md:p-8 flex flex-col shadow-2xl group hover:border-brand-neon/50 transition-all flex-1 backdrop-blur-md relative overflow-hidden">
              
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-neon/5 rounded-full blur-[60px] pointer-events-none"></div>

              {/* Status & Type */}
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center text-brand-neon mb-4 shadow-inner">
                    {transport.type?.toLowerCase().includes('avión') || transport.type?.toLowerCase().includes('vuelo') ? <Plane size={24} /> : <Bus size={24} />}
                  </div>
                  <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter italic leading-none">
                    {transport.company || "Transporte Oficial"}
                  </h3>
                  <p className="text-[10px] font-bold text-brand-neon uppercase tracking-widest mt-1.5">
                    {transport.type || "Bus"} • {transport.seats ? `${transport.seats} Plazas` : 'Plazas Reservadas'}
                  </p>
                </div>
                
                <div className="bg-brand-neon/10 text-brand-neon border border-brand-neon/20 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Confirmado
                </div>
              </div>

              {/* TICKET / TIMELINE VISUAL */}
              <div className="relative bg-[#0D1B2A] rounded-[24px] p-6 border border-white/5 mb-6">
                <div className="relative flex flex-col gap-6">
                  
                  {/* Origen */}
                  <div className="flex gap-4 items-start relative z-10">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-4 h-4 rounded-full border-[3px] border-brand-neon bg-[#0D1B2A] z-10 shadow-[0_0_10px_rgba(var(--brand-neon-rgb),0.5)]"></div>
                      <div className="w-0.5 h-12 bg-gradient-to-b from-brand-neon to-slate-700/50 absolute top-5 left-[7px]"></div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Origen</p>
                      <p className="text-lg font-black text-white leading-none mb-1">{transport.departure_city || "Ciudad Origen"}</p>
                      <p className="text-xs text-brand-neon font-mono font-bold flex items-center gap-1.5">
                        <Clock size={12}/> {transport.departure_time ? new Date(transport.departure_time).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </p>
                    </div>
                  </div>

                  {/* Destino */}
                  <div className="flex gap-4 items-start relative z-10">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-4 h-4 rounded-full border-[3px] border-slate-600 bg-[#0D1B2A] z-10"></div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Destino</p>
                      <p className="text-lg font-black text-white leading-none mb-1">{transport.arrival_city || hotel?.ciudad || "Destino Final"}</p>
                      <p className="text-xs text-slate-400 font-mono font-bold flex items-center gap-1.5">
                        <Clock size={12}/> {transport.arrival_time ? new Date(transport.arrival_time).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Llegada TBC'}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Punto de Encuentro & Contacto */}
              <div className="mt-auto space-y-3 pt-4">
                {transport.meeting_point && (
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-3">
                    <Navigation size={18} className="text-brand-neon shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Punto de Encuentro</p>
                      <p className="text-sm font-bold text-slate-300 leading-tight">{transport.meeting_point}</p>
                    </div>
                  </div>
                )}
                {transport.contact_phone && (
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                    <Phone size={16} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Contacto Chofer/Empresa</p>
                      <p className="text-sm font-bold text-white tracking-widest font-mono">{transport.contact_phone}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[32px] bg-[#162032]/20 p-10 text-center">
               <Bus size={48} className="text-slate-600 mb-4 opacity-50" />
               <p className="text-lg font-black text-white uppercase italic tracking-tighter">Transporte Pendiente</p>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Horarios y vehículos por confirmar.</p>
            </div>
          )}
        </div>

      </div>

      {/* FOOTER INFORMATIVO */}
      {hotel && transport && (
        <div className="mt-8 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start md:items-center gap-4">
          <Info size={24} className="text-blue-500 shrink-0" />
          <p className="text-xs text-slate-300 font-bold leading-relaxed">
            Recuerda comunicar a los padres el punto de encuentro fijado. Si hay algún retraso en el transporte, notifícalo a la organización del torneo usando el número de contacto proporcionado.
          </p>
        </div>
      )}

    </div>
  );
}