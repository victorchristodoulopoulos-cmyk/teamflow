import React, { useState, useMemo, useEffect } from "react";
import { useFamily } from "../../context/FamilyContext"; 
import { supabase } from "../../supabase/supabaseClient"; 
import { getPendingEnrollmentsForFinance, generateInstallments } from "../../supabase/clubTournamentService";
import { 
  CreditCard, CheckCircle, Calendar, Trophy, Loader2, User, 
  Shield, AlertCircle, Zap, Tag 
} from "lucide-react";

interface EnrichedPayment {
  id: string;
  concepto: string;
  importe: number;
  estado: string;
  fecha_vencimiento?: string;
  paid_at?: string;
  created_at: string;
  tournamentName?: string;
  childName: string;
  childId: string;
  clubName: string;
  clubLogo?: string;
  torneo_id: string;
}

// 👇 FUNCIÓN AUXILIAR PARA EL STORAGE
const getClubLogoUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('club-logos').getPublicUrl(path);
  return data.publicUrl;
};

// ⚡ CACHÉ EN MEMORIA: Evita el parpadeo de medio segundo al cambiar de pestañas
let cachedPendingConfigs: any[] | null = null;

export default function FamilyPayments() {
  const { activeChildId, globalData, players = [], loading: appLoading, reloadData } = useFamily();
  const [filter, setFilter] = useState<'pending' | 'history'>('pending');
  const [payingId, setPayingId] = useState<string | null>(null);
  
  // Usamos el caché si existe para que la carga inicial sea instantánea
  const [allPendingConfigs, setAllPendingConfigs] = useState<any[]>(cachedPendingConfigs || []);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const isGlobalView = !activeChildId;

  // 1. Efecto Optimizado: Carga todo una vez y lo guarda en memoria
  useEffect(() => {
    const fetchConfigs = async () => {
      // Si ya hay caché, no disparamos la consulta a la base de datos
      if (cachedPendingConfigs !== null) return; 

      const allPromises = players.map(p => getPendingEnrollmentsForFinance(p.id));
      const results = await Promise.all(allPromises);
      
      cachedPendingConfigs = results.flat();
      setAllPendingConfigs(cachedPendingConfigs);
    };
    
    if (players.length > 0) fetchConfigs();
  }, [players]);

  // 2. Filtro instantáneo en memoria (Vista Global vs Vista Hijo)
  const visiblePendingConfigs = useMemo(() => {
    if (isGlobalView) return allPendingConfigs;
    return allPendingConfigs.filter(c => c.player_id === activeChildId);
  }, [allPendingConfigs, activeChildId, isGlobalView]);

  const handleGenerateInstallments = async (enroll: any, plazos: number) => {
    setGeneratingFor(enroll.id);
    try {
      await generateInstallments(
        enroll.player_id, 
        enroll.team_id, 
        enroll.torneo_id, 
        enroll.precio_total, 
        plazos, 
        enroll.torneos?.name || "Torneo",
        enroll.tiene_matricula || false,
        enroll.precio_matricula || 0
      );
      if (reloadData) await reloadData();
      
      // Actualizamos estado y limpiamos esa tarjeta de la caché
      const newConfigs = allPendingConfigs.filter(p => p.id !== enroll.id);
      cachedPendingConfigs = newConfigs;
      setAllPendingConfigs(newConfigs);
    } catch (e) {
      console.error(e);
      alert("Error generando cuotas");
    } finally {
      setGeneratingFor(null);
    }
  };

  const processedData = useMemo(() => {
    if (!globalData || !players || players.length === 0) {
      return { pending: [], history: [], totalDebt: 0, debtByChild: [], activeDiscounts: [] };
    }

    let allPayments: EnrichedPayment[] = [];
    let debtByChild: { id: string, name: string, total: number }[] = [];
    let activeDiscounts: { tournamentName: string, amount: number, childName: string }[] = [];

    players.forEach(player => {
      const childFinance = globalData[player.id];
      if (!childFinance) return;

      const rawPayments = childFinance.payments || [];
      const enrollments = childFinance.enrollments || [];

      const tournamentContextMap = new Map();
      enrollments.forEach((e: any) => {
        const tId = e.torneo_id;
        const tName = e.torneos?.nombre || e.torneos?.name || "Torneo";
        
        tournamentContextMap.set(tId, {
          tournamentName: tName,
          clubName: e.clubs?.name || "Club",
          clubLogo: getClubLogoUrl(e.clubs?.logo_path)
        });

        if ((!activeChildId || activeChildId === player.id) && e.descuento && Number(e.descuento) > 0) {
          activeDiscounts.push({
            tournamentName: tName,
            amount: Number(e.descuento),
            childName: player.name
          });
        }
      });

      const enriched = rawPayments.map((p: any) => {
        const tourneyInfo = tournamentContextMap.get(p.torneo_id);
        return {
          ...p,
          childName: player.name || "Jugador", 
          childId: player.id,
          clubName: tourneyInfo?.clubName || "Club", 
          clubLogo: tourneyInfo?.clubLogo || null, 
          tournamentName: tourneyInfo?.tournamentName || "Cuota General"
        };
      });

      const childPending = enriched.filter(p => p.estado?.toLowerCase() === 'pendiente');
      const childTotal = childPending.reduce((acc, curr) => acc + Number(curr.importe || 0), 0);

      debtByChild.push({ id: player.id, name: player.name, total: parseFloat(childTotal.toFixed(2)) });
      allPayments = [...allPayments, ...enriched];
    });

    const filtered = activeChildId 
      ? allPayments.filter(p => p.childId === activeChildId)
      : allPayments;

    const history = filtered
      .filter(p => p.estado?.toLowerCase() === 'pagado')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    const pending = filtered
      .filter(p => p.estado?.toLowerCase() === 'pendiente')
      .sort((a, b) => {
        const dateA = a.fecha_vencimiento ? new Date(a.fecha_vencimiento).getTime() : 0;
        const dateB = b.fecha_vencimiento ? new Date(b.fecha_vencimiento).getTime() : 0;
        return dateA - dateB;
      });

    const totalDebt = parseFloat(pending.reduce((acc, curr) => acc + Number(curr.importe || 0), 0).toFixed(2));

    return { pending, history, totalDebt, debtByChild, activeDiscounts };
  }, [globalData, players, activeChildId]);

  const handlePayment = async (pagoId: string) => {
    try {
      setPayingId(pagoId);
      const { data, error } = await supabase.functions.invoke('create-checkout-session', { body: { pago_id: pagoId } });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err) { alert("Error iniciando Stripe."); }
    finally { setPayingId(null); }
  };

  if (appLoading) return (
    <div className="p-10 text-brand-neon animate-pulse font-black uppercase tracking-widest flex items-center gap-3">
      <Loader2 className="animate-spin" /> Sincronizando familia...
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. CABECERA MAESTRA */}
      <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] border border-white/5 bg-[#162032]/60 p-6 md:p-10 backdrop-blur-md shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 md:w-80 md:h-80 bg-brand-neon rounded-full blur-[140px] opacity-[0.07] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
          <div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1 md:mb-2 italic">
              {activeChildId ? `Resumen de ${processedData.debtByChild.find(c => c.id === activeChildId)?.name}` : "Estado Global Familiar"}
            </p>
            <h2 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter italic leading-none">
              {processedData.totalDebt.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
            </h2>
          </div>
          {!activeChildId && players.length > 1 && (
            <div className="flex overflow-x-auto md:flex-wrap gap-2 md:gap-3 w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
              {processedData.debtByChild.map(child => (
                <div key={child.id} className="bg-[#0D1B2A] border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl min-w-[100px] md:min-w-[110px] shadow-lg shrink-0">
                  <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{child.name}</p>
                  <p className={`text-base md:text-lg font-black ${child.total > 0 ? 'text-white' : 'text-brand-neon'}`}>{child.total.toFixed(2)}€</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. ALERTAS DE CONFIGURACIÓN (INSTANTÁNEAS GRACIAS A LA CACHÉ) */}
      {visiblePendingConfigs.length > 0 && (
        <div className={isGlobalView ? "grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in slide-in-from-top-4" : "space-y-4 animate-in slide-in-from-top-4"}>
          {visiblePendingConfigs.map(config => {
            const childData = globalData[config.player_id];
            const currentEnroll = childData?.enrollments?.find((e: any) => e.torneo_id === config.torneo_id);
            const clubLogoUrl = getClubLogoUrl(currentEnroll?.clubs?.logo_path);
            const clubName = currentEnroll?.clubs?.name || "Club";
            const restante = config.tiene_matricula ? config.precio_total - config.precio_matricula : config.precio_total;
            const playerName = players.find(p => p.id === config.player_id)?.name;

            return (
              <div key={config.id} className="relative overflow-hidden rounded-[24px] md:rounded-[32px] border border-blue-500/30 bg-[#162032] p-5 md:p-8 shadow-xl group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                  {clubLogoUrl ? <img src={clubLogoUrl} className="w-32 h-32 md:w-48 md:h-48 object-contain grayscale" alt="" /> : <CreditCard size={100} />}
                </div>
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                    <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                      <AlertCircle size={12} className="md:w-3.5 md:h-3.5" /> Acción Requerida
                    </div>
                    {isGlobalView && (
                      <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-full bg-white/5 text-slate-400 text-[9px] md:text-[10px] font-black uppercase border border-white/5">
                        <User size={10} className="md:w-3 md:h-3" /> {playerName}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 mb-2">
                    {clubLogoUrl && <img src={clubLogoUrl} className="w-10 h-10 md:w-12 md:h-12 object-contain" alt="Club" />}
                    <div>
                      <h3 className="text-xl md:text-2xl font-display font-black text-white italic uppercase leading-none">{config.torneos?.name}</h3>
                      <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{clubName}</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs md:text-sm mt-2 md:mt-3 max-w-2xl leading-relaxed">
                    Precio total: <strong className="text-white">{config.precio_total}€</strong>.
                    Elige plan de cuotas:
                  </p>
                  
                  <div className="mt-4 md:mt-6 grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-4">
                    {config.plazos_permitidos.map((plazo: number) => {
                      const cuota = (restante / plazo).toFixed(2);
                      return (
                        <button
                          key={plazo}
                          onClick={() => handleGenerateInstallments(config, plazo)}
                          disabled={generatingFor === config.id}
                          className="flex flex-col items-start justify-center p-3 md:p-5 rounded-xl md:rounded-2xl bg-[#0D1B2A] border border-white/10 hover:border-brand-neon hover:bg-brand-neon/5 transition-all md:min-w-[140px] md:flex-1 group disabled:opacity-50"
                        >
                          <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 group-hover:text-brand-neon text-left line-clamp-1">
                            {plazo === 1 ? "Pago Único" : `${plazo} Plazos`}
                          </span>
                          
                          <div className="flex flex-col items-start gap-0.5 md:gap-1 mt-0.5 md:mt-1 w-full">
                            <span className="text-lg md:text-2xl font-black text-white italic leading-none">
                              {cuota}€ {plazo > 1 && <span className="text-[9px] md:text-xs text-slate-500 not-italic">/mes</span>}
                            </span>
                            
                            {config.tiene_matricula && (
                              <span className="text-[8px] md:text-[10px] text-orange-400 font-black uppercase tracking-tight mt-1 bg-orange-500/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-left">
                                + {config.precio_matricula}€ <span className="hidden sm:inline">Matrícula</span><span className="inline sm:hidden">Matr.</span>
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. LISTADO DE RECIBOS */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 md:pb-4">
          <div className="flex gap-6 md:gap-8">
            <button onClick={() => setFilter('pending')} className={`px-1 md:px-2 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative ${filter === 'pending' ? "text-brand-neon" : "text-slate-500"}`}>
              Pendiente ({processedData.pending.length})
              {filter === 'pending' && <div className="absolute -bottom-[14px] md:-bottom-[18px] left-0 right-0 h-1 bg-brand-neon rounded-full" />}
            </button>
            <button onClick={() => setFilter('history')} className={`px-1 md:px-2 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative ${filter === 'history' ? "text-brand-neon" : "text-slate-500"}`}>
              Historial ({processedData.history.length})
              {filter === 'history' && <div className="absolute -bottom-[14px] md:-bottom-[18px] left-0 right-0 h-1 bg-brand-neon rounded-full" />}
            </button>
          </div>
        </div>

        {/* MENSÁJITOS DE DESCUENTO */}
        {filter === 'pending' && processedData.activeDiscounts.length > 0 && (
          <div className={isGlobalView ? "grid grid-cols-1 xl:grid-cols-2 gap-3" : "grid gap-3"}>
            {processedData.activeDiscounts.map((disc, idx) => (
              <div key={idx} className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-[20px] md:rounded-[24px] bg-brand-neon/10 border border-brand-neon/20 animate-in slide-in-from-left duration-700">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-neon flex items-center justify-center text-brand-deep shadow-[0_0_20px_rgba(var(--brand-neon-rgb),0.4)] shrink-0">
                  <Tag size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] font-black text-brand-neon uppercase tracking-widest mb-0.5">
                    {isGlobalView ? `¡Bono para ${disc.childName}!` : "¡Bonificación Aplicada!"}
                  </p>
                  <p className="text-xs md:text-sm text-white font-bold uppercase leading-tight">
                    Descuento de <span className="text-brand-neon text-base md:text-lg">{disc.amount}€</span> en <span className="italic text-brand-neon">{disc.tournamentName}</span>.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RECIBOS */}
        <div className={isGlobalView ? "grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4" : "grid gap-3 md:gap-4"}>
          {(filter === 'pending' ? processedData.pending : processedData.history).map((p) => (
            <PaymentCard key={p.id} payment={p} type={filter} onPay={handlePayment} isProcessing={payingId === p.id} isCompact={isGlobalView} />
          ))}

          {((filter === 'pending' && processedData.pending.length === 0) || (filter === 'history' && processedData.history.length === 0)) && (
             <div className={`text-center py-16 md:py-24 border-2 border-dashed border-white/5 rounded-[32px] md:rounded-[40px] bg-[#162032]/20 ${isGlobalView ? 'xl:col-span-2' : ''}`}>
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-neon/5 flex items-center justify-center mx-auto mb-4 md:mb-6 border border-brand-neon/10">
                 <CheckCircle size={32} className="md:w-10 md:h-10 text-brand-neon" />
               </div>
               <p className="text-white font-black uppercase italic text-lg md:text-xl tracking-tight">¡Todo en orden!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// COMPONENTE TARJETA DE PAGO (ADAPTATIVO)
function PaymentCard({ payment, type, onPay, isProcessing, isCompact }: any) {
  const isPending = type === 'pending';
  const isMatricula = payment.concepto.toLowerCase().includes('matrícula') || payment.concepto.toLowerCase().includes('reserva');
  
  const containerClasses = isPending
    ? isMatricula
      ? "bg-orange-500/10 border-orange-500/30 shadow-lg shadow-orange-500/5"
      : "bg-[#162032]/80 border-white/10 hover:border-brand-neon/30"
    : "bg-[#162032]/40 border-white/5 opacity-80";

  const layoutClasses = isCompact 
    ? "flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 md:gap-6" 
    : "flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6";

  const actionLayoutClasses = isCompact 
    ? "flex items-center justify-between 2xl:justify-end gap-4 md:gap-6 border-t 2xl:border-t-0 border-white/5 pt-4 md:pt-5 2xl:pt-0"
    : "flex items-center justify-between md:justify-end gap-4 md:gap-8 border-t md:border-t-0 border-white/5 pt-4 md:pt-5 md:pt-0";

  return (
    <div className={`relative overflow-hidden border rounded-[20px] md:rounded-[28px] p-4 md:p-6 transition-all group ${layoutClasses} ${containerClasses}`}>
      <div className="flex items-start gap-3 md:gap-5">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-105 ${
          isMatricula && isPending 
            ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' 
            : 'bg-white/5 border-white/10 text-slate-500'
        }`}>
            {payment.clubLogo ? (
              <img src={payment.clubLogo} className="w-6 h-6 md:w-8 md:h-8 object-contain" alt="Club" />
            ) : (
              isMatricula && isPending ? <Zap size={20} className="md:w-6 md:h-6 animate-pulse" /> : <Shield size={20} className="md:w-6 md:h-6" />
            )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 md:mb-1">
            <p className="text-[9px] md:text-[10px] text-brand-neon font-black uppercase tracking-widest italic">{payment.childName}</p>
            {isMatricula && <span className="px-1.5 md:px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[7px] md:text-[8px] font-black uppercase tracking-widest">Reserva</span>}
          </div>
          <h4 className="text-lg md:text-xl font-bold text-white leading-none mb-1.5 md:mb-2 truncate uppercase tracking-tight">{payment.concepto}</h4>
          <div className="flex flex-col gap-0.5 md:gap-1">
             <span className="flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
               <Trophy size={10} className="md:w-3 md:h-3 text-brand-neon shrink-0" /> 
               <span className="truncate">{payment.tournamentName}</span>
               <span className="text-slate-600 shrink-0 mx-1">•</span>
               <span className="text-slate-600 truncate">{payment.clubName}</span>
             </span>
             <span className={`flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${isMatricula && isPending ? 'text-orange-400' : 'text-slate-500'}`}>
               <Calendar size={10} className="md:w-3 md:h-3"/> {isPending ? `VENCE: ${payment.fecha_vencimiento || "---"}` : `PAGADO: ${new Date(payment.created_at).toLocaleDateString()}`}
             </span>
          </div>
        </div>
      </div>

      <div className={actionLayoutClasses}>
         <div className="text-left md:text-right">
           <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-0.5 md:mb-1 ${isMatricula ? 'text-orange-400/80' : 'text-slate-600'}`}>Importe</p>
           <p className="text-xl md:text-2xl font-black text-white italic tracking-tighter">{Number(payment.importe).toFixed(2)}€</p>
         </div>

         {isPending ? (
           <button 
             onClick={() => onPay?.(payment.id)} 
             disabled={isProcessing}
             className={`${
               isMatricula 
                ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                : 'bg-brand-neon hover:bg-white text-brand-deep shadow-[0_0_20px_rgba(var(--brand-neon),0.2)]'
             } px-6 md:px-8 h-10 md:h-14 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all flex items-center gap-2 md:gap-3 active:scale-95 shrink-0`}
           >
             {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <CreditCard size={14} className="md:w-4 md:h-4" />} Pagar
           </button>
         ) : (
           <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center text-brand-neon shrink-0">
             <CheckCircle size={20} className="md:w-6 md:h-6" />
           </div>
         )}
      </div>
    </div>
  );
}