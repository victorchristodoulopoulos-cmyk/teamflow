import React, { useState, useMemo, useEffect } from "react";
import { useFamily } from "../../context/FamilyContext"; 
import { supabase } from "../../supabase/supabaseClient"; 
import { 
  CreditCard, CheckCircle, Calendar, Trophy, Loader2, User, 
  Shield, AlertCircle, Zap, Tag, Landmark, X, Clock, Map as MapIcon, Plane
} from "lucide-react"; 

// 🔥 1. MOTOR DE GENERACIÓN UNIFICADO (TORNEOS + STAGES)
const generateEventInstallments = async (enroll: any, plazos: number) => {
  const insertData = [];
  const today = new Date();
  let restante = enroll.precio_total;
  
  const isStage = enroll.type === 'stage';
  const eventIdColumn = isStage ? 'stage_id' : 'torneo_id';
  const eventIdValue = isStage ? enroll.stage_id : enroll.torneo_id;
  const eventName = isStage ? enroll.stages?.nombre : enroll.torneos?.name;

  if (enroll.tiene_matricula && enroll.precio_matricula > 0) {
    restante = enroll.precio_total - enroll.precio_matricula;
    insertData.push({ 
      player_id: enroll.player_id, 
      [eventIdColumn]: eventIdValue, 
      club_id: enroll.club_id, 
      concepto: `Reserva / Matrícula - ${eventName}`, 
      importe: enroll.precio_matricula, 
      estado: 'pendiente', 
      fecha_vencimiento: today.toISOString().split('T')[0] 
    });
  }

  if (restante > 0) {
    const baseCuota = Math.floor((restante / plazos) * 100) / 100;
    let acumulado = 0;
    for (let i = 0; i < plazos; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + (enroll.tiene_matricula ? i + 1 : i));
      const conceptoCuota = plazos === 1 && !enroll.tiene_matricula ? `Pago Único - ${eventName}` : `Cuota ${i + 1}/${plazos} - ${eventName}`;
      let importeActual = baseCuota;
      if (i === plazos - 1) importeActual = parseFloat((restante - acumulado).toFixed(2));
      else acumulado += baseCuota;
      
      insertData.push({ 
        player_id: enroll.player_id, 
        [eventIdColumn]: eventIdValue, 
        club_id: enroll.club_id, 
        concepto: conceptoCuota, 
        importe: importeActual, 
        estado: 'pendiente', 
        fecha_vencimiento: dueDate.toISOString().split('T')[0] 
      });
    }
  }

  const { error } = await supabase.from('pagos').insert(insertData);
  if (error) throw error;
  return true;
};

const getClubLogoUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('club-logos').getPublicUrl(path);
  return data.publicUrl;
};

export default function FamilyPayments() {
  const { activeChildId, players = [], loading: appLoading } = useFamily();
  const [filter, setFilter] = useState<'pending' | 'history'>('pending');
  const [payingId, setPayingId] = useState<string | null>(null);
  
  const [allPendingConfigs, setAllPendingConfigs] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]); 
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [transferModal, setTransferModal] = useState<{open: boolean, payment: any}>({open: false, payment: null});
  const [processingTransfer, setProcessingTransfer] = useState(false);

  const isGlobalView = !activeChildId;

  // 🚀 2. BÚSQUEDA AUTÓNOMA BLINDADA (Leyendo explícitamente de club_stages)
  useEffect(() => {
    const fetchEverything = async () => {
      if (players.length === 0) {
        setLoadingData(false);
        return;
      }
      
      const playerIds = players.map(p => p.id);
      
      try {
        // A. Traemos todos los pagos ya generados
        const { data: pagosData } = await supabase
          .from("pagos")
          .select("*, torneos(name), stages(nombre), clubs(name, logo_path)")
          .in("player_id", playerIds);

        if (pagosData) setAllPayments(pagosData);

        // B. Traemos las inscripciones básicas
        const [torneosRes, stagesRes] = await Promise.all([
          supabase.from('torneo_jugadores').select('*, torneos(name), clubs(name, logo_path)').in('player_id', playerIds),
          supabase.from('stage_inscripciones').select('*, stages(nombre), clubs(name, logo_path)').in('player_id', playerIds)
        ]);

        const inscritosTorneos = torneosRes.data || [];
        const inscritosStages = stagesRes.data || [];

        // C. 🔥 MAGIA PURA: Buscamos en club_stages y club_torneos las configuraciones exactas
        const clubIds = [...new Set([...inscritosTorneos.map(t=>t.club_id), ...inscritosStages.map(s=>s.club_id)])];
        const torneoIds = [...new Set(inscritosTorneos.map(t=>t.torneo_id))];
        const stageIds = [...new Set(inscritosStages.map(s=>s.stage_id))];

        const [clubTorneosRes, clubStagesRes] = await Promise.all([
          torneoIds.length > 0 ? supabase.from('club_torneos').select('*').in('club_id', clubIds).in('torneo_id', torneoIds) : { data: [] },
          stageIds.length > 0 ? supabase.from('club_stages').select('*').in('club_id', clubIds).in('stage_id', stageIds) : { data: [] }
        ]);

        const pendingToGenerate: any[] = [];
        
        // Cruzamos Torneos
        inscritosTorneos.forEach((enroll: any) => {
          const hasPayments = pagosData?.some(p => p.torneo_id === enroll.torneo_id && p.player_id === enroll.player_id);
          const config = clubTorneosRes.data?.find(c => c.club_id === enroll.club_id && c.torneo_id === enroll.torneo_id);
          
          if (!hasPayments && config && config.precio_total > 0) {
            const conf = typeof config.configuracion_pagos === 'string' ? JSON.parse(config.configuracion_pagos) : config.configuracion_pagos;
            pendingToGenerate.push({
              ...enroll, type: 'torneo',
              precio_total: config.precio_total,
              plazos_permitidos: conf?.plazos_permitidos || [1],
              tiene_matricula: conf?.tiene_matricula || false,
              precio_matricula: conf?.precio_matricula || 0
            });
          }
        });

        // 🔥 Cruzamos Stages (Leyendo 100% de club_stages)
        inscritosStages.forEach((enroll: any) => {
          const hasPayments = pagosData?.some(p => p.stage_id === enroll.stage_id && p.player_id === enroll.player_id);
          const config = clubStagesRes.data?.find(c => c.club_id === enroll.club_id && c.stage_id === enroll.stage_id);
          
          if (!hasPayments && config && config.precio_total > 0) {
            const conf = typeof config.configuracion_pagos === 'string' ? JSON.parse(config.configuracion_pagos) : config.configuracion_pagos;
            pendingToGenerate.push({
              ...enroll, type: 'stage',
              precio_total: config.precio_total, // ← Precio del club_stages
              plazos_permitidos: conf?.plazos_permitidos || [1],
              tiene_matricula: conf?.tiene_matricula || false,
              precio_matricula: conf?.precio_matricula || 0
            });
          }
        });

        setAllPendingConfigs(pendingToGenerate);

      } catch (e) {
        console.error("Error unificando finanzas:", e);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchEverything();
  }, [players]);

  const visiblePendingConfigs = useMemo(() => {
    if (isGlobalView) return allPendingConfigs;
    return allPendingConfigs.filter(c => c.player_id === activeChildId);
  }, [allPendingConfigs, activeChildId, isGlobalView]);

  const handleGenerate = async (config: any, plazos: number) => {
    setGeneratingFor(config.id);
    try {
      await generateEventInstallments(config, plazos);
      window.location.reload(); 
    } catch (e) {
      alert("Error generando cuotas");
      setGeneratingFor(null);
    }
  };

  const processedData = useMemo(() => {
    let history: any[] = [];
    let pending: any[] = [];
    let totalDebt = 0;
    let debtByChildMap: Record<string, number> = {};

    players.forEach(p => debtByChildMap[p.id] = 0);

    const filteredPayments = activeChildId ? allPayments.filter(p => p.player_id === activeChildId) : allPayments;

    filteredPayments.forEach(p => {
      const childName = players.find(pl => pl.id === p.player_id)?.name || "Jugador";
      const clubName = p.clubs?.name || "Club";
      const clubLogo = getClubLogoUrl(p.clubs?.logo_path);
      const isStage = !!p.stage_id;
      const eventName = isStage ? p.stages?.nombre : p.torneos?.name;

      const formatted = { ...p, childName, clubName, clubLogo, eventName, isStage };

      if (p.estado?.toLowerCase() === 'pagado') {
        history.push(formatted);
      } else if (['pendiente', 'pendiente_verificacion', 'procesando'].includes(p.estado?.toLowerCase())) {
        pending.push(formatted);
        totalDebt += Number(p.importe);
        debtByChildMap[p.player_id] += Number(p.importe);
      }
    });

    history.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    pending.sort((a, b) => (a.fecha_vencimiento ? new Date(a.fecha_vencimiento).getTime() : 0) - (b.fecha_vencimiento ? new Date(b.fecha_vencimiento).getTime() : 0));

    const debtByChild = players.map(p => ({
      id: p.id, name: p.name, total: parseFloat(debtByChildMap[p.id].toFixed(2))
    }));

    return { history, pending, totalDebt: parseFloat(totalDebt.toFixed(2)), debtByChild };
  }, [allPayments, players, activeChildId]);

  const handlePayment = async (pagoId: string) => {
    try {
      setPayingId(pagoId);
      const response = await supabase.functions.invoke('create-checkout-session', { body: { pago_id: pagoId } });
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      if (response.data?.url) window.location.href = response.data.url;
    } catch (err: any) { 
      alert(`Error: ${err.message}`); 
    } finally { 
      setPayingId(null); 
    }
  };

  const handleConfirmTransfer = async () => {
    if (!transferModal.payment) return;
    setProcessingTransfer(true);
    try {
      const { error } = await supabase.from('pagos').update({ estado: 'pendiente_verificacion', metodo_pago: 'Transferencia' }).eq('id', transferModal.payment.id);
      if (error) throw error;
      setTransferModal({open: false, payment: null});
      window.location.reload();
    } catch (e) {
      alert("Error al notificar la transferencia");
    } finally {
      setProcessingTransfer(false);
    }
  };

  if (appLoading || loadingData) return (
    <div className="p-10 text-brand-neon animate-pulse font-black uppercase tracking-widest flex items-center gap-3">
      <Loader2 className="animate-spin" /> Sincronizando Caja Central...
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* CABECERA MAESTRA */}
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

      {/* 🚀 TARJETAS DE CONFIGURACIÓN PENDIENTE (ELIGE TUS PLAZOS) */}
      {visiblePendingConfigs.length > 0 && (
        <div className={isGlobalView ? "grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in slide-in-from-top-4" : "space-y-4 animate-in slide-in-from-top-4"}>
          {visiblePendingConfigs.map(config => {
            const clubLogoUrl = getClubLogoUrl(config.clubs?.logo_path);
            const clubName = config.clubs?.name || "Club";
            const restante = config.tiene_matricula ? config.precio_total - config.precio_matricula : config.precio_total;
            const playerName = players.find(p => p.id === config.player_id)?.name;
            const eventName = config.type === 'stage' ? config.stages?.nombre : config.torneos?.name;
            
            // Colores e iconos dinámicos
            const isStage = config.type === 'stage';
            const themeColor = isStage ? 'amber' : 'brand-neon';
            const bgClass = isStage ? 'bg-amber-500/10' : 'bg-brand-neon/10';
            const borderClass = isStage ? 'border-amber-500/30' : 'border-brand-neon/30';
            const textClass = isStage ? 'text-amber-500' : 'text-brand-neon';

            return (
              <div key={`${config.type}-${config.id}`} className={`relative overflow-hidden rounded-[24px] md:rounded-[32px] border ${borderClass} bg-[#162032] p-5 md:p-8 shadow-xl group`}>
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                  {isStage ? <Plane size={100} /> : <Trophy size={100} />}
                </div>
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                    <div className={`inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-full ${bgClass} ${textClass} text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${borderClass}`}>
                      <AlertCircle size={12} className="md:w-3.5 md:h-3.5" /> Pago Pendiente
                    </div>
                    {isStage && (
                      <div className={`inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[9px] md:text-[10px] font-black uppercase border border-amber-500/20`}>
                        <MapIcon size={10} className="md:w-3 md:h-3" /> Stage & Viaje
                      </div>
                    )}
                    {isGlobalView && (
                      <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-full bg-white/5 text-slate-400 text-[9px] md:text-[10px] font-black uppercase border border-white/5">
                        <User size={10} className="md:w-3 md:h-3" /> {playerName}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 mb-2">
                    {clubLogoUrl && <img src={clubLogoUrl} className="w-10 h-10 md:w-12 md:h-12 object-contain" alt="Club" />}
                    <div>
                      <h3 className="text-xl md:text-2xl font-display font-black text-white italic uppercase leading-none">{eventName}</h3>
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
                          onClick={() => handleGenerate(config, plazo)}
                          disabled={generatingFor === config.id}
                          className={`flex flex-col items-start justify-center p-3 md:p-5 rounded-xl md:rounded-2xl bg-[#0D1B2A] border border-white/10 hover:border-${themeColor} transition-all md:min-w-[140px] md:flex-1 group disabled:opacity-50`}
                        >
                          <span className={`text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 group-hover:text-${themeColor} text-left line-clamp-1`}>
                            {plazo === 1 ? "Pago Único" : `${plazo} Plazos`}
                          </span>
                          
                          <div className="flex flex-col items-start gap-0.5 md:gap-1 mt-0.5 md:mt-1 w-full">
                            <span className="text-lg md:text-2xl font-black text-white italic leading-none">
                              {cuota}€ {plazo > 1 && <span className="text-[9px] md:text-xs text-slate-500 not-italic">/mes</span>}
                            </span>
                            {config.tiene_matricula && (
                              <span className="text-[8px] md:text-[10px] text-orange-400 font-black uppercase tracking-tight mt-1 bg-orange-500/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-left">
                                + {config.precio_matricula}€ Matrícula
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

      {/* LISTADO DE RECIBOS */}
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

        <div className={isGlobalView ? "grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4" : "grid gap-3 md:gap-4"}>
          {(filter === 'pending' ? processedData.pending : processedData.history).map((p) => (
            <PaymentCard 
              key={p.id} 
              payment={p} 
              type={filter} 
              onPay={handlePayment} 
              onTransfer={() => setTransferModal({open: true, payment: p})}
              isProcessing={payingId === p.id} 
              isCompact={isGlobalView} 
            />
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

      {/* MODAL DE TRANSFERENCIA */}
      {transferModal.open && transferModal.payment && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#162032] border border-blue-500/20 rounded-[32px] w-full max-w-md p-8 shadow-2xl relative">
             <button onClick={() => setTransferModal({open: false, payment: null})} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={20}/></button>
             
             <div className="flex items-center gap-3 mb-4">
               <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                 <Landmark size={24} />
               </div>
               <h3 className="text-2xl font-display font-black text-white italic uppercase leading-none">Aviso Transferencia</h3>
             </div>
             
             <p className="text-sm text-slate-400 mb-6">
               Para pagar, envía <strong className="text-white">{transferModal.payment.importe}€</strong> a la cuenta del club. El administrador lo validará manualmente.
             </p>

             <div className="space-y-4 mb-8 p-5 bg-[#0D1B2A] border border-white/5 rounded-2xl">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Concepto</p>
                  <p className="text-sm font-bold text-white uppercase">{transferModal.payment.childName} - {transferModal.payment.concepto}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">IBAN del Club</p>
                  <p className="text-lg font-mono text-brand-neon tracking-wider">ES91 2100 0000 0000</p>
                </div>
             </div>

             <button 
               onClick={handleConfirmTransfer} 
               disabled={processingTransfer} 
               className="w-full py-4 bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-blue-400 transition-all flex items-center justify-center gap-2"
             >
                {processingTransfer ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18}/>}
                Notificar Pago Realizado
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 🚀 3. COMPONENTE TARJETA DE PAGO (INTELIGENTE: TORNEO VS STAGE)
function PaymentCard({ payment, type, onPay, onTransfer, isProcessing, isCompact }: any) {
  const isPending = type === 'pending';
  const isMatricula = payment.concepto.toLowerCase().includes('matrícula') || payment.concepto.toLowerCase().includes('reserva');
  
  const isPendingVerification = payment.estado?.toLowerCase() === 'pendiente_verificacion';
  const isProcessingBank = payment.estado?.toLowerCase() === 'procesando';
  const isStage = payment.isStage;

  let containerClasses = "bg-[#162032]/40 border-white/5 opacity-80";
  if (isPending) {
    if (isPendingVerification) {
      containerClasses = "bg-blue-500/10 border-blue-500/30 shadow-lg opacity-100";
    } else if (isProcessingBank) {
      containerClasses = "bg-yellow-500/10 border-yellow-500/30 shadow-lg opacity-100";
    } else if (isStage) {
      containerClasses = "bg-amber-500/10 border-amber-500/30 shadow-lg opacity-100 hover:border-amber-500/50";
    } else if (isMatricula) {
      containerClasses = "bg-orange-500/10 border-orange-500/30 shadow-lg opacity-100";
    } else {
      containerClasses = "bg-[#162032]/80 border-white/10 hover:border-brand-neon/30 opacity-100";
    }
  }

  // 🔥 CLINICAL CHANGE: Flexbox mejorado para que NUNCA se rompa
  return (
    <div className={`relative overflow-hidden border rounded-[20px] md:rounded-[28px] p-4 md:p-6 transition-all group flex flex-col gap-4 md:gap-5 ${containerClasses}`}>
      
      {/* SECCIÓN SUPERIOR: Icono e Info */}
      <div className="flex items-start gap-3 md:gap-5 w-full">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-105 ${
          isPendingVerification ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
          isProcessingBank ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
          isStage && isPending ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' :
          isMatricula && isPending ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 
          'bg-white/5 border-white/10 text-slate-500'
        }`}>
            {payment.clubLogo ? (
              <img src={payment.clubLogo} className="w-6 h-6 md:w-8 md:h-8 object-contain" alt="Club" />
            ) : (
              isStage ? <MapIcon size={20} className="md:w-6 md:h-6" /> : <Trophy size={20} className="md:w-6 md:h-6" />
            )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5 md:mb-1">
            <p className="text-[9px] md:text-[10px] text-brand-neon font-black uppercase tracking-widest italic truncate max-w-full">{payment.childName}</p>
            {isStage && <span className="px-1.5 md:px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[7px] md:text-[8px] font-black uppercase tracking-widest border border-amber-500/20 shrink-0">Viaje</span>}
            {isMatricula && !isProcessingBank && !isPendingVerification && <span className="px-1.5 md:px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[7px] md:text-[8px] font-black uppercase tracking-widest shrink-0">Reserva</span>}
            {isPendingVerification && <span className="px-1.5 md:px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[7px] md:text-[8px] font-black uppercase tracking-widest shrink-0">Verificando...</span>}
            {isProcessingBank && <span className="px-1.5 md:px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[7px] md:text-[8px] font-black uppercase tracking-widest shrink-0">Procesando</span>}
          </div>
          <h4 className="text-base md:text-xl font-bold text-white leading-tight mb-1.5 md:mb-2 line-clamp-2 uppercase tracking-tight">{payment.concepto}</h4>
          <div className="flex flex-col gap-0.5 md:gap-1">
             <span className="flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
               {isStage ? <MapIcon size={10} className="md:w-3 md:h-3 text-amber-500 shrink-0" /> : <Trophy size={10} className="md:w-3 md:h-3 text-brand-neon shrink-0" />} 
               <span className="truncate">{payment.eventName}</span>
               <span className="text-slate-600 shrink-0 mx-1">•</span>
               <span className="text-slate-600 truncate">{payment.clubName}</span>
             </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: Precio y Botones (Siempre separados con línea) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/5 pt-4 md:pt-5 w-full">
         <div className="text-left w-full sm:w-auto">
           <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-0.5 md:mb-1 text-slate-600`}>Importe</p>
           <p className="text-xl md:text-2xl font-black text-white italic tracking-tighter leading-none">{Number(payment.importe).toFixed(2)}€</p>
         </div>

         {isPending ? (
           isPendingVerification ? (
             <div className="w-full sm:w-auto px-6 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest text-center shrink-0">
               Verificando...
             </div>
           ) : (
             <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button onClick={() => onTransfer?.()} disabled={isProcessing} className="flex-1 sm:flex-none bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-4 md:px-5 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                  <Landmark size={14} /> Transf.
                </button>
                <button onClick={() => onPay?.(payment.id)} disabled={isProcessing} className={`flex-1 sm:flex-none ${isStage ? 'bg-amber-500 text-brand-deep shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-brand-neon text-brand-deep shadow-[0_0_20px_rgba(var(--brand-neon),0.2)]'} hover:bg-white px-5 md:px-6 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap`}>
                  {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <CreditCard size={14} />} Pagar
                </button>
             </div>
           )
         ) : (
           <div className="flex flex-col items-center sm:items-end w-full sm:w-auto shrink-0 ml-auto sm:ml-0">
             <div className="w-full sm:w-auto px-5 md:px-6 py-3 md:py-3.5 rounded-xl md:rounded-2xl bg-brand-neon/10 border border-brand-neon/20 text-brand-neon flex items-center justify-center gap-2 cursor-default">
               <CheckCircle size={16} className="md:w-[18px] md:h-[18px]" />
               <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Abonado</span>
             </div>
             {/* 🔥 CLINICAL CHANGE: Mostrar el método de pago si existe */}
             {payment.metodo_pago && (
               <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5 sm:pr-2">
                 Vía {payment.metodo_pago}
               </span>
             )}
           </div>
         )}
      </div>
    </div>
  );
}