import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { getMyClubContext } from "../../supabase/clubService";
import { updateClubPaymentConfig } from "../../supabase/clubTournamentService";
import { 
  CreditCard, Search, Filter, TrendingUp, AlertCircle, 
  CheckCircle2, DollarSign, ArrowDownToLine, Clock, Wallet, Tag, X, Save, Loader2, Edit3, Banknote, HelpCircle, RefreshCw, Landmark, ShieldAlert, Settings, Map
} from "lucide-react";

type Payment = {
  id: string;
  concepto: string;
  importe: number;
  estado: string;
  fecha_vencimiento: string;
};

type PlayerFinanceRow = {
  player_id: string;
  enrollment_id: string;
  name: string;
  surname: string;
  dni: string;
  payments: Record<string, Payment>;
  totalPaid: number;
  totalPending: number;
  descuento: number;
  isUpToDate: boolean;
  hasPlanGenerated: boolean;
};

export default function ClubPayments() {
  const [loading, setLoading] = useState(true);
  const [clubId, setClubId] = useState("");
  
  // 🔥 NUEVO: Selector Unificado (Torneos + Stages)
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedEventType, setSelectedEventType] = useState<'torneo' | 'stage'>('torneo');

  const [searchTerm, setSearchTerm] = useState("");
  const [financialData, setFinancialData] = useState<PlayerFinanceRow[]>([]);
  const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
  
  const [kpis, setKpis] = useState({ totalExpected: 0, totalCollected: 0, totalDebt: 0 });
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  const [activeTab, setActiveTab] = useState<'resumen' | 'config'>('resumen');

  // STRIPE
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [stripeOnboardingComplete, setStripeOnboardingComplete] = useState<boolean>(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  
  const [admiteTarjeta, setAdmiteTarjeta] = useState(true);
  const [admiteTransferencia, setAdmiteTransferencia] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);

  // Modales
  const [discountModal, setDiscountModal] = useState<{open: boolean, player: PlayerFinanceRow | null}>({open: false, player: null});
  const [discountValue, setDiscountValue] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  const [payModal, setPayModal] = useState<{open: boolean, payment: Payment | null, playerName: string}>({open: false, payment: null, playerName: ""});
  const [method, setMethod] = useState("Transferencia");
  const [processingPay, setProcessingPay] = useState(false);

  useEffect(() => { init(); }, []);
  
  useEffect(() => { 
    if (selectedEventId) fetchFinanceData(clubId, selectedEventId, selectedEventType); 
  }, [selectedEventId, selectedEventType]);

  const init = async () => {
    try {
      const { club_id } = await getMyClubContext();
      setClubId(club_id);

      const { data: clubData } = await supabase.from('clubs').select('stripe_account_id, stripe_onboarding_complete, admite_tarjeta, admite_transferencia').eq('id', club_id).single();

      let accountId = null;
      let isComplete = false;

      if (clubData) {
        accountId = clubData.stripe_account_id;
        isComplete = clubData.stripe_onboarding_complete || false;
        setStripeAccountId(accountId);
        setStripeOnboardingComplete(isComplete);
        setAdmiteTarjeta(clubData.admite_tarjeta ?? true);
        setAdmiteTransferencia(clubData.admite_transferencia ?? true);
      }

      // 🔥 OBTENER TORNEOS Y STAGES AL MISMO TIEMPO
      const [torneosData, stagesData] = await Promise.all([
        supabase.from("club_torneos").select(`torneo_id, torneos (name)`).eq("club_id", club_id),
        supabase.from("stages").select(`id, nombre`).eq("club_id", club_id)
      ]);

      const combinedEvents = [];
      
      if (torneosData.data) {
        torneosData.data.forEach(t => {
          if (t.torneos) combinedEvents.push({ id: t.torneo_id, type: 'torneo', name: t.torneos.name });
        });
      }
      
      if (stagesData.data) {
        stagesData.data.forEach(s => {
          combinedEvents.push({ id: s.id, type: 'stage', name: s.nombre });
        });
      }

      setEvents(combinedEvents);
      if (combinedEvents.length > 0) {
        setSelectedEventId(combinedEvents[0].id);
        setSelectedEventType(combinedEvents[0].type as 'torneo' | 'stage');
      } else {
        setLoading(false);
      }
    } catch (e) { setLoading(false); }
  };

  const verifyStripeStatus = async (currentClubId: string) => {
    try {
      const { data: statusData } = await supabase.functions.invoke('check-stripe-status', { body: { club_id: currentClubId } });
      if (statusData?.complete) {
        setStripeOnboardingComplete(true);
        await supabase.from('clubs').update({ stripe_onboarding_complete: true }).eq('id', currentClubId);
        return true;
      }
      return false;
    } catch (error) { return false; }
  };

  // 🔥 EL MOTOR INTELIGENTE: Adapta las consultas si es Torneo o Stage
  const fetchFinanceData = async (club_id: string, eventId: string, eventType: 'torneo' | 'stage') => {
    setLoading(true);
    try {
      // 1. Elegimos las tablas según el tipo
      const rosterTable = eventType === 'torneo' ? 'torneo_jugadores' : 'stage_inscripciones';
      const rosterColumnFilter = eventType === 'torneo' ? 'torneo_id' : 'stage_id';
      
      const configTable = eventType === 'torneo' ? 'club_torneos' : 'stages';
      const configFilterColumn = eventType === 'torneo' ? 'torneo_id' : 'id';

      // 2. Extraemos el Roster y la Configuración de Precio
      const [rosterRes, configRes, pagosRes] = await Promise.all([
        supabase.from(rosterTable).select(`id, player_id, descuento, jugadores (name, surname, dni)`).eq('club_id', club_id).eq(rosterColumnFilter, eventId),
        supabase.from(configTable).select('precio_total').eq('club_id', club_id).eq(configFilterColumn, eventId).single(),
        supabase.from('pagos').select('*').eq('club_id', club_id).eq(rosterColumnFilter, eventId)
      ]);

      const roster = rosterRes.data || [];
      const precioTotal = configRes.data?.precio_total || 0;
      const pagos = pagosRes.data || [];

      if (!roster.length) {
        setFinancialData([]);
        setDynamicColumns([]);
        setKpis({ totalExpected: 0, totalCollected: 0, totalDebt: 0 });
        setLoading(false);
        return;
      }

      // 3. Organizar Columnas Dinámicas
      const cuotasSet = new Set<string>();
      let hasMatricula = false;

      pagos.forEach(p => {
        const c = p.concepto.toLowerCase();
        if (c.includes('matrícula') || c.includes('reserva')) hasMatricula = true;
        if (c.includes('cuota') || c.includes('pago único')) {
          const match = p.concepto.match(/Cuota (\d+)/i);
          const cuotaLabel = match ? `Cuota ${match[1]}` : "Cuota 1";
          cuotasSet.add(cuotaLabel);
        }
      });
      
      const sortedCuotas = Array.from(cuotasSet).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
      const finalCols = hasMatricula ? ["Reserva / Matrícula", ...sortedCuotas] : sortedCuotas;
      setDynamicColumns(finalCols);

      let expected = 0, collected = 0, debt = 0;

      // 4. Calcular la Matriz Financiera
      const matrix: PlayerFinanceRow[] = roster.map((r: any) => {
        const playerPayments = pagos.filter(p => p.player_id === r.player_id) || [];
        const paymentsMap: Record<string, Payment> = {};
        let pPaid = 0, pPending = 0;
        const hasPlanGenerated = playerPayments.length > 0;

        if (!hasPlanGenerated) {
          pPending = precioTotal - (r.descuento || 0);
          expected += precioTotal;
          debt += pPending;
        } else {
          playerPayments.forEach(p => {
            const c = p.concepto.toLowerCase();
            let key = "";
            if (c.includes('matrícula') || c.includes('reserva')) key = "Reserva / Matrícula";
            else {
              const match = p.concepto.match(/Cuota (\d+)/i);
              key = match ? `Cuota ${match[1]}` : "Cuota 1";
            }
            paymentsMap[key] = p;
            expected += p.importe;
            if (p.estado === 'pagado') { pPaid += p.importe; collected += p.importe; }
            else { pPending += p.importe; debt += p.importe; }
          });
        }

        return {
          player_id: r.player_id,
          enrollment_id: r.id,
          name: r.jugadores?.name || 'Desconocido',
          surname: r.jugadores?.surname || '',
          dni: r.jugadores?.dni || '---',
          payments: paymentsMap,
          totalPaid: parseFloat(pPaid.toFixed(2)),
          totalPending: parseFloat(pPending.toFixed(2)),
          descuento: r.descuento || 0,
          isUpToDate: pPending === 0 && hasPlanGenerated,
          hasPlanGenerated
        };
      });

      setKpis({ 
        totalExpected: parseFloat(expected.toFixed(2)), 
        totalCollected: parseFloat(collected.toFixed(2)), 
        totalDebt: parseFloat(debt.toFixed(2)) 
      });
      setFinancialData(matrix);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [type, id] = e.target.value.split('|');
    setSelectedEventType(type as 'torneo' | 'stage');
    setSelectedEventId(id);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // 🔥 LÓGICA DE DESCUENTOS LOCAL (Soporta Torneo y Stage)
  const openEditModal = (row: PlayerFinanceRow) => {
    setDiscountModal({ open: true, player: row });
    setDiscountValue(row.descuento.toString());
  };

  const handleApplyDiscount = async () => {
    if (!discountModal.player || !discountValue) return;
    setApplyingDiscount(true);
    try {
      const targetTable = selectedEventType === 'torneo' ? 'torneo_jugadores' : 'stage_inscripciones';
      await supabase.from(targetTable).update({ descuento: parseFloat(discountValue) }).eq('id', discountModal.player.enrollment_id);
      await fetchFinanceData(clubId, selectedEventId, selectedEventType);
      setDiscountModal({open: false, player: null});
    } catch (e) { alert("Error al aplicar descuento"); }
    finally { setApplyingDiscount(false); }
  };

  const handleManualPayment = async () => {
    if (!payModal.payment) return;
    setProcessingPay(true);
    try {
      const { error } = await supabase.from('pagos').update({ estado: 'pagado', metodo_pago: method, fecha_pago: new Date().toISOString() }).eq('id', payModal.payment.id);
      if (error) throw error;
      await fetchFinanceData(clubId, selectedEventId, selectedEventType);
      setPayModal({open: false, payment: null, playerName: ""});
    } catch (e) { alert("Error al registrar pago"); }
    finally { setProcessingPay(false); }
  };

  const handleStripeConnect = async () => {
    setConnectingStripe(true);
    try {
      if (stripeAccountId) {
        const isReady = await verifyStripeStatus(clubId);
        if (isReady) { setConnectingStripe(false); return; }
      }
      const { data, error } = await supabase.functions.invoke('stripe-onboarding', { body: { club_id: clubId } });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error) { alert("Hubo un error al generar el enlace de Stripe."); } 
    finally { setConnectingStripe(false); }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await updateClubPaymentConfig(clubId, admiteTarjeta, admiteTransferencia);
      alert("✅ Preferencias de pago del club actualizadas.");
    } catch (error) { alert("Error al guardar la configuración."); } 
    finally { setSavingConfig(false); }
  };

  const processedData = useMemo(() => {
    let filtered = financialData.filter(row => `${row.name} ${row.surname}`.toLowerCase().includes(searchTerm.toLowerCase()));
    filtered.sort((a, b) => {
      let valA: any = a[sortConfig.key as keyof PlayerFinanceRow];
      let valB: any = b[sortConfig.key as keyof PlayerFinanceRow];
      if (sortConfig.key === 'name') { valA = `${a.name} ${a.surname}`.toLowerCase(); valB = `${b.name} ${b.surname}`.toLowerCase(); }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [financialData, searchTerm, sortConfig]);

  const progressPercentage = kpis.totalExpected > 0 ? Math.round((kpis.totalCollected / kpis.totalExpected) * 100) : 0;

  if (loading && events.length === 0) return <div className="p-10 text-brand-neon animate-pulse font-black uppercase text-center tracking-widest">Iniciando Motor Financiero...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2.5 rounded-xl bg-brand-neon/10 border border-brand-neon/20">
                <Wallet size={20} className="text-brand-neon" />
             </div>
             <h1 className="text-3xl md:text-4xl font-display font-black tracking-tighter italic text-white uppercase leading-none">Caja Central</h1>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Gestión de cobros de Torneos y Stages</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-stretch sm:items-center">
          {!stripeAccountId ? (
            <button onClick={handleStripeConnect} disabled={connectingStripe} className="px-5 py-3 rounded-xl bg-brand-neon text-[#0D1B2A] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_0_20px_rgba(201,255,47,0.3)] shrink-0">
              {connectingStripe ? <Loader2 className="animate-spin" size={16}/> : <CreditCard size={16}/>} Activar Cobros
            </button>
          ) : !stripeOnboardingComplete ? (
            <button onClick={handleStripeConnect} disabled={connectingStripe} className="px-5 py-3 rounded-xl bg-orange-500 text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] shrink-0">
               {connectingStripe ? <RefreshCw className="animate-spin" size={16}/> : <AlertCircle size={16}/>} Finalizar Registro Stripe
            </button>
          ) : (
             <div className="px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shrink-0 cursor-default">
               <CheckCircle2 size={16}/> Cobros Activos
             </div>
          )}

          {activeTab === 'resumen' && (
            <select 
              className="w-full sm:w-64 bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs uppercase tracking-widest focus:border-brand-neon outline-none"
              value={`${selectedEventType}|${selectedEventId}`} 
              onChange={handleEventChange}
            >
              {events.map(ev => (
                <option key={ev.id} value={`${ev.type}|${ev.id}`}>
                  {ev.type === 'stage' ? '✈️ ' : '🏆 '}{ev.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('resumen')} className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'resumen' ? 'bg-brand-neon text-[#0D1B2A]' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
          <div className="flex items-center gap-2"><DollarSign size={16}/> Matriz Financiera</div>
        </button>
        <button onClick={() => setActiveTab('config')} className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-brand-neon text-[#0D1B2A]' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
          <div className="flex items-center gap-2"><Settings size={16}/> Configurar Pasarela</div>
        </button>
      </div>

      {activeTab === 'resumen' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="p-5 rounded-2xl bg-[#162032]/60 border border-white/5 flex justify-between items-center shadow-lg">
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ArrowDownToLine size={12}/> Previsión Total</p>
                   <span className="text-2xl font-display font-black text-white tracking-tighter">{kpis.totalExpected.toLocaleString()}€</span>
                </div>
                <DollarSign size={24} className="text-slate-700"/>
             </div>
             <div className="p-5 rounded-2xl bg-[#162032]/60 border border-brand-neon/20 flex justify-between items-center shadow-lg relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-black/50"><div className="h-full bg-brand-neon" style={{ width: `${progressPercentage}%` }}></div></div>
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><CheckCircle2 size={12} className="text-brand-neon"/> Recaudado ({progressPercentage}%)</p>
                   <span className="text-2xl font-display font-black text-brand-neon tracking-tighter">{kpis.totalCollected.toLocaleString()}€</span>
                </div>
                <TrendingUp size={24} className="text-brand-neon/40"/>
             </div>
             <div className="p-5 rounded-2xl bg-[#162032]/60 border border-red-500/10 flex justify-between items-center shadow-lg">
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Clock size={12} className="text-red-500"/> Deuda Pendiente</p>
                   <span className="text-2xl font-display font-black text-red-500 tracking-tighter">{kpis.totalDebt.toLocaleString()}€</span>
                </div>
                <AlertCircle size={24} className="text-red-500/40"/>
             </div>
          </div>

          <div className="bg-[#162032]/40 border border-white/5 rounded-[32px] shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/20">
               <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-2">Control de Recibos</h3>
               <div className="relative w-full sm:w-72">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                 <input className="w-full bg-[#0D1B2A] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs font-bold tracking-widest outline-none focus:border-brand-neon" placeholder="Buscar jugador..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead className="bg-black/40 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('name')}>Jugador</th>
                    <th className="px-4 py-4 text-right cursor-pointer" onClick={() => handleSort('totalPaid')}>Pagado</th>
                    <th className="px-4 py-4 text-right cursor-pointer" onClick={() => handleSort('totalPending')}>Deuda</th>
                    {dynamicColumns.map(col => <th key={col} className="px-4 py-4 text-center text-blue-400">{col}</th>)}
                    <th className="px-6 py-4 text-center text-orange-400">Descuento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {processedData.map((row) => (
                    <tr key={row.player_id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-white uppercase">{row.name} {row.surname}</p>
                        <p className="text-[9px] font-mono text-slate-500">{row.dni}</p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-lg font-black text-emerald-400">{row.totalPaid}€</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-lg font-black text-red-500 italic">-{row.totalPending}€</span>
                      </td>
                      
                      {dynamicColumns.map(col => {
                        const p = row.payments[col];
                        if (!row.hasPlanGenerated) {
                            return (
                                <td key={col} className="px-4 py-4 text-center">
                                    <div className="inline-flex items-center gap-1 text-[10px] font-black text-orange-400/40 uppercase tracking-tighter opacity-50">
                                        <HelpCircle size={12}/> Pendiente
                                    </div>
                                </td>
                            );
                        }
                        if (!p) return <td key={col} className="px-4 py-4 text-center text-slate-700 font-black text-sm">—</td>;
                        return (
                          <td key={col} className="px-4 py-4 text-center">
                            <button 
                              disabled={p.estado === 'pagado'}
                              onClick={() => setPayModal({open: true, payment: p, playerName: row.name})}
                              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border w-28 transition-all ${
                                p.estado === 'pagado' 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 cursor-default' 
                                  : 'bg-orange-500/10 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black hover:scale-105'
                              }`}
                            >
                               <span className="text-sm font-black">{p.importe.toFixed(2)}€</span>
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-center">
                        {row.descuento > 0 ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-brand-neon bg-brand-neon/10 px-2 py-1 rounded">-{row.descuento}€ Aplicado</span>
                            <button onClick={() => openEditModal(row)} className="text-[8px] text-slate-500 hover:text-white uppercase font-black underline underline-offset-4 tracking-widest">EDITAR</button>
                          </div>
                        ) : (
                          <button onClick={() => openEditModal(row)} className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-black transition-all"><Tag size={16} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {processedData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No hay inscripciones registradas en este evento todavía.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-[#162032]/80 border border-white/5 p-8 rounded-[32px] shadow-xl animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Pasarela de Pagos (Stripe)</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">Activa o desactiva las formas de pago que ofrecerás a las familias. Las comisiones indicadas son las oficiales de Stripe.</p>
            </div>
            <button onClick={handleSaveConfig} disabled={savingConfig} className="flex items-center gap-2 bg-brand-neon text-[#0D1B2A] px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-[0_0_30px_rgba(201,255,47,0.3)] disabled:opacity-50">
              {savingConfig ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              Guardar Ajustes
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-[24px] border transition-all ${admiteTarjeta ? 'bg-[#0f172a] border-brand-neon/50 shadow-lg' : 'bg-black/20 border-white/5 opacity-60'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center"><CreditCard size={24} /></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={admiteTarjeta} onChange={(e) => setAdmiteTarjeta(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-neon"></div>
                </label>
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-2">Pago por Tarjeta</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">El dinero llega al instante. Acepta Visa, Mastercard, Apple Pay y Google Pay.</p>
            </div>
            <div className={`p-6 rounded-[24px] border transition-all ${admiteTransferencia ? 'bg-[#0f172a] border-brand-neon/50 shadow-lg' : 'bg-black/20 border-white/5 opacity-60'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center"><Landmark size={24} /></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={admiteTransferencia} onChange={(e) => setAdmiteTransferencia(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-neon"></div>
                </label>
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-2">Transferencia Bancaria</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">Transferencia directa. Tarda entre 2 y 4 días. Ideal para reducir comisiones.</p>
            </div>
          </div>
        </div>
      )}

      {payModal.open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#162032] border border-brand-neon/20 rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative">
             <h3 className="text-2xl font-display font-black text-white italic uppercase mb-1">Registrar Cobro</h3>
             <p className="text-xs text-slate-400 font-bold mb-6 uppercase tracking-widest">{payModal.playerName} • {payModal.payment?.concepto}</p>
             <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Importe a recibir</p>
                   <p className="text-4xl font-display font-black text-brand-neon">{payModal.payment?.importe.toFixed(2)}€</p>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Método de recepción</label>
                   <select className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-brand-neon" value={method} onChange={(e) => setMethod(e.target.value)}>
                     <option value="Transferencia">🏦 Transferencia Bancaria</option>
                     <option value="Bizum">📱 Bizum</option>
                     <option value="Efectivo">💵 Efectivo / Metálico</option>
                     <option value="Tpv">💳 TPV Físico</option>
                   </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPayModal({open: false, payment: null, playerName: ""})} className="flex-1 py-4 text-slate-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors">Cancelar</button>
                  <button onClick={handleManualPayment} disabled={processingPay} className="flex-[2] py-4 bg-brand-neon text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--brand-neon-rgb),0.3)]">
                    {processingPay ? <Loader2 className="animate-spin" size={18}/> : <><Banknote size={18}/> Confirmar Pago</>}
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {discountModal.open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#162032] border border-orange-500/20 rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative">
             <button onClick={() => setDiscountModal({open: false, player: null})} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={20}/></button>
             <h3 className="text-2xl font-display font-black text-white italic uppercase mb-1">Aplicar Bono</h3>
             <p className="text-xs text-slate-400 font-bold mb-6 uppercase tracking-widest">{discountModal.player?.name}</p>
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Importe del descuento (EUR)</label>
                   <input autoFocus type="number" className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-4 text-white font-display font-black text-2xl focus:border-orange-500 outline-none mt-2" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="0.00" />
                </div>
                <button onClick={handleApplyDiscount} disabled={applyingDiscount} className="w-full py-4 bg-orange-500 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
                   {applyingDiscount ? <Loader2 className="animate-spin" size={18}/> : <><Tag size={18}/> Confirmar Descuento</>}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}