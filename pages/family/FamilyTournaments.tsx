import { useFamily } from "../../context/FamilyContext";
import { Calendar, MapPin, Trophy, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FamilyTournaments() {
  const navigate = useNavigate();
  // 1. Conectamos al "Cerebro" (Contexto)
  const { players, globalData, loading: appLoading } = useFamily();

  // Si la app está arrancando (solo pasa la primera vez que entras a la web)
  if (appLoading) return <div className="p-10 text-brand-neon animate-pulse font-black uppercase">Iniciando Calendario...</div>;

  // 2. Procesamos los datos en memoria (Instantáneo)
  let allTournaments: any[] = [];

  players.forEach(p => {
    const cache = globalData[p.id];
    if (cache && cache.enrollments) {
      // Enriquecemos cada inscripción con el nombre del niño
      const enriched = cache.enrollments.map((e: any) => ({
        ...e,
        childName: p.name,
        childId: p.id
      }));
      allTournaments = [...allTournaments, ...enriched];
    }
  });

  // 3. Ordenamos: Los futuros primero, los pasados al final (o por fecha estricta)
  allTournaments.sort((a, b) => {
    // Si no tiene fecha (TBC), lo ponemos al final de los futuros
    if (!a.torneos?.fecha) return 1;
    if (!b.torneos?.fecha) return -1;
    return new Date(a.torneos.fecha).getTime() - new Date(b.torneos.fecha).getTime();
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">Calendario de Torneos</h2>
          <p className="text-slate-500 text-xs uppercase tracking-[0.2em] mt-1 font-bold">Agenda consolidada de {players.length} jugadores</p>
        </div>
        
        {/* Pequeña leyenda */}
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-neon"></span> Activo</span>
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600"></span> Finalizado</span>
        </div>
      </div>

      {/* GRID DE TORNEOS */}
      <div className="grid gap-4">
        {allTournaments.map((item) => {
          // Lógica de estado
          const hasDate = !!item.torneos?.fecha;
          const dateObj = hasDate ? new Date(item.torneos.fecha) : null;
          const isPast = dateObj && dateObj < new Date();
          const isTBC = !hasDate; // To Be Confirmed

          return (
            <div 
              key={item.id} 
              className={`relative overflow-hidden border rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all group ${
                isPast 
                  ? "bg-[#162032]/20 border-white/5 opacity-60 grayscale hover:opacity-100 hover:grayscale-0" 
                  : "bg-[#162032]/60 border-white/10 hover:border-brand-neon/40 hover:bg-[#162032]/90 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
              }`}
            >
              
              <div className="flex items-center gap-6">
                {/* --- LOGO CLUB CON FALLBACK --- */}
                <div className="w-16 h-16 rounded-2xl bg-[#0D1B2A] border border-white/5 flex items-center justify-center text-brand-neon shadow-xl group-hover:scale-105 transition-transform overflow-hidden relative shrink-0">
                  {item.equipos?.clubs?.logo_path ? (
                    <img 
                      src={item.equipos.clubs.logo_path} 
                      alt="Club Logo" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                         // Ocultar imagen rota y mostrar icono hermano
                         (e.target as HTMLImageElement).style.display = 'none';
                         (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {/* Icono visible por defecto si no hay path, o si la imagen falla (al quitarle el hidden) */}
                  <Trophy size={28} className={`absolute ${item.equipos?.clubs?.logo_path ? 'hidden' : ''}`} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {/* Badge Niño */}
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[9px] font-black uppercase tracking-widest border border-white/5">
                      {item.childName}
                    </span>
                    {/* Badge Club */}
                    <span className="text-[10px] font-bold text-brand-neon uppercase tracking-widest">
                      {item.equipos?.clubs?.name}
                    </span>
                  </div>
                  
                  <h4 className="text-xl md:text-2xl font-bold text-white uppercase italic tracking-tight leading-none mb-2">
                    {item.torneos?.nombre}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <MapPin size={12} className={isPast ? "text-slate-600" : "text-brand-neon"} /> 
                      {item.torneos?.ciudad || "Sede por confirmar"}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Calendar size={12} className={isPast ? "text-slate-600" : "text-brand-neon"} /> 
                      {hasDate ? dateObj?.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' }) : "Fecha TBC"}
                    </span>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: ESTADO Y BOTÓN */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 mt-2 md:mt-0 pl-20 md:pl-0">
                 
                 {/* Badge Estado */}
                 <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase flex items-center gap-2 ${
                   isPast 
                    ? 'border-white/5 bg-white/5 text-slate-500' 
                    : (isTBC ? 'border-orange-500/20 bg-orange-500/10 text-orange-400' : 'border-brand-neon/20 bg-brand-neon/10 text-brand-neon')
                 }`}>
                   {isPast && <CheckCircle size={10} />}
                   {isTBC && <Clock size={10} />}
                   {!isPast && !isTBC && <div className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse" />}
                   
                   {isPast ? "FINALIZADO" : (isTBC ? "POR CONFIRMAR" : (item.torneos?.estado || "ACTIVO"))}
                 </div>

                 {/* Botón Gestión Rápida */}
                 {!isPast && (
                    <button 
                      onClick={() => navigate(`/family-dashboard/pagos?child=${item.childId}`)}
                      className="hidden group-hover:flex items-center gap-2 text-[10px] font-bold text-white hover:text-brand-neon transition-colors uppercase tracking-widest"
                    >
                      Gestionar Pagos <Trophy size={10} />
                    </button>
                 )}
              </div>
            </div>
          );
        })}
        
        {/* EMPTY STATE */}
        {allTournaments.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[32px] bg-[#162032]/20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-600">
               <Calendar size={32} />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No hay torneos en la agenda</p>
            <p className="text-slate-600 text-xs mt-2 max-w-xs mx-auto">
              Cuando el club inscriba a tus hijos en un torneo, aparecerá automáticamente aquí.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}