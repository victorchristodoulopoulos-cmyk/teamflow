import React, { useState } from "react";
import { useFamily } from "../../context/FamilyContext";
import { 
  Calendar, MapPin, Trophy, Clock, CheckCircle, ChevronRight, 
  User, Shield, Bus, Hotel, X, Navigation, Phone, Info, Loader2, Map
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { getFamilyTournamentLogistics } from "../../supabase/logisticsService";

// 👇 FUNCIÓN AUXILIAR PARA EL STORAGE
const getClubLogoUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('club-logos').getPublicUrl(path);
  return data.publicUrl;
};

const getHotelImg = (path: string | null) => {
  if (!path) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000";
  if (path.startsWith('http')) return path;
  return supabase.storage.from('hoteles').getPublicUrl(path).data.publicUrl;
};

const formatDT = (dateStr: string | null) => {
  if (!dateStr) return "TBC";
  return new Date(dateStr).toLocaleString('es-ES', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
};

export default function FamilyTournaments() {
  const navigate = useNavigate();
  const { players, globalData, activeChildId, loading: appLoading } = useFamily();

  // Estados para el Modal de Logística
  const [selectedLogistics, setSelectedLogistics] = useState<{hotel: any, transport: any} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingLogistics, setLoadingLogistics] = useState(false);
  const [currentTourneyName, setCurrentTourneyName] = useState("");

  if (appLoading) return (
    <div className="p-10 text-brand-neon animate-pulse font-black uppercase tracking-widest flex items-center gap-3 justify-center min-h-[60vh]">
      <Clock className="animate-spin" /> Sincronizando Calendario...
    </div>
  );

  // 1. PROCESAMIENTO DE DATOS (Mapeo corregido para no perder club_id ni team_id)
  let allTournaments: any[] = [];
  players.forEach(p => {
    if (activeChildId && p.id !== activeChildId) return;
    const cache = globalData[p.id];
    if (cache && cache.enrollments) {
      const enriched = cache.enrollments.map((e: any) => ({
        ...e,
        childName: p.name,
        childId: p.id,
        // Forzamos que estas propiedades existan en el objeto que pasamos a la Card
        club_id: e.club_id,
        team_id: e.team_id
      }));
      allTournaments = [...allTournaments, ...enriched];
    }
  });

  // 2. ORDENACIÓN
  allTournaments.sort((a, b) => {
    if (!a.torneos?.fecha) return 1;
    if (!b.torneos?.fecha) return -1;
    return new Date(a.torneos.fecha).getTime() - new Date(b.torneos.fecha).getTime();
  });

  const handleOpenLogistics = async (playerId: string, torneoId: string, tourneyName: string) => {
    setCurrentTourneyName(tourneyName);
    setIsModalOpen(true);
    setLoadingLogistics(true);
    try {
      // Llamada al servicio con los datos rescatados del mapeo
      const data = await getFamilyTournamentLogistics(playerId, torneoId);
      setSelectedLogistics(data);
    } catch (err) {
      console.error("Error cargando logística:", err);
    } finally {
      setLoadingLogistics(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* CABECERA DINÁMICA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-brand-neon text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic">Official Schedule</p>
          <h2 className="text-4xl md:text-6xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
            Calendario <span className="text-slate-700">Torneos</span>
          </h2>
        </div>
        
        <div className="flex gap-4 p-1.5 rounded-2xl bg-[#162032]/40 border border-white/5 backdrop-blur-sm">
           <StatusLegend color="bg-brand-neon" label="Activo" />
           <StatusLegend color="bg-orange-500" label="TBC" />
           <StatusLegend color="bg-slate-600" label="Pasado" />
        </div>
      </div>

      {/* GRID DE TORNEOS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {allTournaments.map((item) => (
          <TournamentCard 
            key={item.id} 
            item={item} 
            navigate={navigate} 
            onOpenLogistics={() => handleOpenLogistics(item.childId, item.torneo_id, item.torneos?.name)}
          />
        ))}

        {allTournaments.length === 0 && (
          <div className="col-span-full text-center py-32 border-2 border-dashed border-white/5 rounded-[40px] bg-[#162032]/20">
            <Shield size={64} className="text-slate-700 mx-auto mb-6 opacity-20" />
            <p className="text-white font-black uppercase italic text-xl tracking-tight">Agenda despejada</p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">No hay inscripciones registradas</p>
          </div>
        )}
      </div>

      {/* ==========================================
          MODAL LOGÍSTICA
          ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-[#05080f] overflow-y-auto animate-in slide-in-from-bottom-4 duration-500 flex flex-col">
          <div className="sticky top-0 z-50 bg-[#05080f]/90 backdrop-blur-xl border-b border-white/10 px-6 py-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-brand-neon uppercase tracking-widest mb-1 flex items-center gap-2">
                <Bus size={14} /> Información de Viaje
              </p>
              <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter leading-none">{currentTourneyName}</h2>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
            {loadingLogistics ? (
               <div className="h-[60vh] flex flex-col items-center justify-center">
                 <Loader2 className="animate-spin text-brand-neon mb-4" size={40} />
                 <span className="text-brand-neon font-black uppercase tracking-widest animate-pulse">Cargando Hoja de Ruta...</span>
               </div>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* 🏨 HOTEL */}
                 <div className="flex flex-col h-full">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> Alojamiento Expedición
                    </h3>
                    {selectedLogistics?.hotel ? (
                      <div className="bg-[#162032] border border-white/10 rounded-[40px] overflow-hidden flex flex-col shadow-2xl flex-1 backdrop-blur-sm">
                        <div className="h-64 relative overflow-hidden bg-black">
                          <img src={getHotelImg(selectedLogistics.hotel.image_path)} alt="Hotel" className="w-full h-full object-cover opacity-70" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#162032] via-transparent to-transparent"></div>
                          <div className="absolute top-6 left-6">
                            <div className="bg-blue-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                              <CheckCircle size={12} /> Reserva Confirmada
                            </div>
                          </div>
                        </div>
                        <div className="p-8 flex flex-col flex-1 relative z-10 -mt-8">
                          <h4 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-none mb-3">{selectedLogistics.hotel.name}</h4>
                          <p className="text-slate-400 text-sm font-bold flex items-center gap-2 mb-8">
                            <MapPin size={18} className="text-blue-500 shrink-0" /> 
                            {selectedLogistics.hotel.address || selectedLogistics.hotel.ciudad}
                          </p>
                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-5 rounded-3xl bg-[#0D1B2A] border border-white/5">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={12}/> Check-In</p>
                              <p className="text-xs font-black text-white">{formatDT(selectedLogistics.hotel.check_in)}</p>
                            </div>
                            <div className="p-5 rounded-3xl bg-[#0D1B2A] border border-white/5">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={12}/> Check-Out</p>
                              <p className="text-xs font-black text-white">{formatDT(selectedLogistics.hotel.check_out)}</p>
                            </div>
                          </div>
                          {selectedLogistics.hotel.google_maps_url && (
                            <a href={selectedLogistics.hotel.google_maps_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                              <Map size={18} /> Ver en Google Maps
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[40px] bg-white/5 p-10 text-center min-h-[350px]">
                         <Hotel size={48} className="text-slate-600 mb-4 opacity-50" />
                         <p className="text-xl font-black text-white uppercase italic tracking-tighter">Alojamiento en gestión</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 max-w-xs">TeamFlow confirmará el hotel próximamente.</p>
                      </div>
                    )}
                 </div>

                 {/* 🚌 TRANSPORTE */}
                 <div className="flex flex-col h-full">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-neon"></span> Horarios de Viaje
                    </h3>
                    {selectedLogistics?.transport ? (
                      <div className="bg-[#162032] border border-brand-neon/20 rounded-[40px] p-8 flex flex-col shadow-2xl relative overflow-hidden flex-1 backdrop-blur-sm">
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-neon/5 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-10 relative z-10">
                          <div>
                            <div className="w-14 h-14 rounded-2xl bg-brand-neon/10 flex items-center justify-center text-brand-neon mb-4">
                              <Bus size={28} />
                            </div>
                            <h4 className="text-3xl font-display font-black text-white uppercase tracking-tighter italic leading-none">{selectedLogistics.transport.company}</h4>
                            <p className="text-[10px] font-bold text-brand-neon uppercase tracking-widest mt-2">Transporte Oficial Expedición</p>
                          </div>
                        </div>
                        <div className="relative bg-[#0D1B2A] rounded-[32px] p-8 border border-white/5 mb-8 flex-1">
                          <div className="relative flex flex-col gap-10">
                            <div className="flex gap-6 items-start relative z-10">
                              <div className="flex flex-col items-center pt-1.5">
                                <div className="w-4 h-4 rounded-full border-[3px] border-brand-neon bg-[#0D1B2A] z-10 shadow-[0_0_10px_rgba(var(--brand-neon-rgb),0.5)]"></div>
                                <div className="w-0.5 h-20 bg-gradient-to-b from-brand-neon to-slate-700/50 absolute top-5 left-[7px]"></div>
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Punto de Salida</p>
                                <p className="text-xl font-black text-white leading-none mb-1.5">{selectedLogistics.transport.departure_city}</p>
                                <p className="text-sm text-brand-neon font-mono font-bold flex items-center gap-2">
                                  <Clock size={14}/> {formatDT(selectedLogistics.transport.departure_time)}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-6 items-start relative z-10">
                              <div className="flex flex-col items-center pt-1.5">
                                <div className="w-4 h-4 rounded-full border-[3px] border-slate-600 bg-[#0D1B2A] z-10"></div>
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Llegada Estimada</p>
                                <p className="text-xl font-black text-white leading-none mb-1.5">{selectedLogistics.transport.arrival_city || selectedLogistics.hotel?.ciudad}</p>
                                <p className="text-sm text-slate-400 font-mono font-bold flex items-center gap-2">
                                  <Clock size={14}/> {formatDT(selectedLogistics.transport.arrival_time)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-white/5">
                          <div className="bg-white/5 p-4 rounded-2xl flex items-start gap-4">
                            <Navigation size={20} className="text-brand-neon shrink-0 mt-1" />
                            <div>
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Punto de Encuentro</p>
                              <p className="text-sm font-bold text-slate-200 leading-tight">{selectedLogistics.transport.meeting_point || "Consultar con el club"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[40px] bg-white/5 p-10 text-center min-h-[350px]">
                         <Bus size={48} className="text-slate-600 mb-4 opacity-50" />
                         <p className="text-xl font-black text-white uppercase italic tracking-tighter">Horarios por confirmar</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 max-w-xs">El club informará de los horarios una vez se cierre la expedición.</p>
                      </div>
                    )}
                 </div>
               </div>
            )}
            
            <div className="mt-10 p-6 bg-brand-neon/5 border border-brand-neon/20 rounded-3xl flex items-center gap-4">
              <Info size={24} className="text-brand-neon shrink-0" />
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Esta información es exclusiva para los participantes del torneo. Los horarios pueden sufrir ligeras modificaciones por tráfico o logística. Ante cualquier duda, contacte con el coordinador de su club.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUBCOMPONENTES ---

function StatusLegend({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`}></span>
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    </div>
  );
}

function TournamentCard({ item, navigate, onOpenLogistics }: { item: any, navigate: any, onOpenLogistics: () => void }) {
  const hasDate = !!item.torneos?.fecha;
  const dateObj = hasDate ? new Date(item.torneos.fecha) : null;
  const isPast = dateObj && dateObj < new Date();
  const isTBC = !hasDate;
  
  const clubLogo = getClubLogoUrl(item.clubs?.logo_path);
  const clubName = item.clubs?.name || "Club Confirmado";

  const containerClasses = isPast 
    ? "bg-[#162032]/20 border-white/5 grayscale opacity-70" 
    : "bg-gradient-to-br from-[#162032] to-[#0D1B2A] border-white/10 hover:border-brand-neon/30 hover:shadow-2xl hover:shadow-brand-neon/5";

  return (
    <div className={`relative overflow-hidden border rounded-[40px] p-6 md:p-8 transition-all duration-500 group ${containerClasses}`}>
      {!isPast && <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-neon rounded-full blur-[80px] opacity-0 group-hover:opacity-[0.05] transition-opacity"></div>}

      <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start relative z-10">
        
        {/* FECHA BADGE */}
        <div className="flex flex-col items-center shrink-0">
          <div className={`w-16 h-20 rounded-2xl flex flex-col items-center justify-center border ${
            isPast ? 'bg-white/5 border-white/10' : 'bg-brand-neon border-brand-neon shadow-lg shadow-brand-neon/20'
          }`}>
            <span className={`text-[10px] font-black uppercase ${isPast ? 'text-slate-500' : 'text-brand-deep'}`}>
              {dateObj ? dateObj.toLocaleDateString('es-ES', { month: 'short' }) : '---'}
            </span>
            <span className={`text-3xl font-display font-black leading-none ${isPast ? 'text-slate-400' : 'text-brand-deep'}`}>
              {dateObj ? dateObj.getDate() : '??'}
            </span>
          </div>
          {!isPast && !isTBC && <div className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse mt-4" />}
        </div>

        {/* INFO */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-1.5">
               <User size={10} className="text-brand-neon" />
               <span className="text-[9px] font-black text-white uppercase tracking-widest">{item.childName}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{clubName}</span>
          </div>

          <h4 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tighter leading-tight mb-4 group-hover:text-brand-neon transition-colors">
            {item.torneos?.name}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
               <MapPin size={14} className={isPast ? "text-slate-600" : "text-brand-neon"} />
               {item.torneos?.ciudad || "Sede por confirmar"}
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
               <Shield size={14} className={isPast ? "text-slate-600" : "text-brand-neon"} />
               Participación Activa
            </div>
          </div>
        </div>

        {/* LOGO CLUB */}
        <div className="shrink-0 self-center md:self-start">
           <div className="w-20 h-20 rounded-[24px] bg-[#0D1B2A] border border-white/5 flex items-center justify-center p-4 shadow-2xl relative group-hover:scale-110 transition-all duration-500">
             {clubLogo ? (
               <img src={clubLogo} alt="Club" className="w-full h-full object-contain" />
             ) : (
               <Shield size={32} className="text-slate-800" />
             )}
           </div>
        </div>
      </div>

      {/* ACCIÓN FOOTER */}
      {!isPast && (
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
          <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${isTBC ? 'text-orange-500' : 'text-brand-neon'}`}>
            {isTBC ? 'Esperando confirmación de fecha' : 'Inscripción confirmada'}
          </span>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenLogistics}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-slate-300 hover:text-brand-neon hover:border-brand-neon/30 transition-all uppercase tracking-widest"
            >
              <Bus size={14} /> Plan Viaje
            </button>
            
            <button 
              onClick={() => navigate(`/family-dashboard/pagos`)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-brand-neon text-brand-deep rounded-2xl text-[9px] font-black hover:bg-white transition-all uppercase tracking-widest group/btn shadow-lg shadow-brand-neon/10"
            >
              Pagos <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}