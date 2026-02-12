import { useState, useMemo, useEffect } from "react";
import { useFamily } from "../../context/FamilyContext";
import { supabase } from "../../supabase/supabaseClient"; 
import { CreditCard, CheckCircle, Calendar, Trophy, Loader2, User, Shield, Filter, AlertCircle } from "lucide-react";

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
}

interface PaymentCardProps {
  payment: EnrichedPayment;
  type: 'pending' | 'history';
  onPay?: (id: string) => void;
  isProcessing?: boolean;
}

export default function FamilyPayments() {
  const { activeChildId, setActiveChildId, globalData, children = [], loading: appLoading } = useFamily();
  const [filter, setFilter] = useState<'pending' | 'history'>('pending');
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
      alert("¡Pago procesado con éxito!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const processedData = useMemo(() => {
    if (!globalData || !children || children.length === 0) {
      return { pending: [], history: [], totalDebt: 0 };
    }

    let allPayments: EnrichedPayment[] = [];

    children.forEach(child => {
      const childFinance = globalData[child.id];
      if (!childFinance) {
        console.warn(`⚠️ No hay datos financieros cargados para: ${child.nombre}`);
        return;
      }

      // CORRECCIÓN CLAVE: Buscamos 'payments' O 'pagos' por si acaso
      const rawPayments = childFinance.payments || childFinance.pagos || [];
      
      // DEBUG: Ver qué está llegando realmente
      console.log(`🔎 Pagos encontrados para ${child.nombre}:`, rawPayments.length);

      const enrollments = childFinance.enrollments || [];

      const tournamentMap = new Map();
      enrollments.forEach((e: any) => {
        if (e.torneos) {
          tournamentMap.set(e.torneos.id, e.torneos.nombre);
          if (e.equipo_id) tournamentMap.set(e.equipo_id, e.torneos.nombre);
        }
      });

      const enriched = rawPayments.map((p: any) => ({
        ...p,
        childName: child.nombre || "Hijo",
        childId: child.id,
        clubName: child.clubes?.nombre || "Club", 
        clubLogo: child.clubes?.logo_url,
        tournamentName: p.torneo_id 
          ? tournamentMap.get(p.torneo_id) 
          : (p.team_id ? tournamentMap.get(p.team_id) : "General")
      }));

      allPayments = [...allPayments, ...enriched];
    });

    const filteredByChild = activeChildId 
      ? allPayments.filter(p => p.childId === activeChildId)
      : allPayments;

    // Ordenar por fecha de creación o vencimiento
    filteredByChild.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // CORRECCIÓN DE ESTADO: Aseguramos que coincida con tu base de datos ('pendiente' vs 'pending')
    const pending = filteredByChild.filter(p => p.estado === 'pendiente' || p.estado === 'pending');
    const history = filteredByChild.filter(p => p.estado === 'pagado' || p.estado === 'paid');
    
    const totalDebt = pending.reduce((acc, curr) => acc + Number(curr.importe), 0);

    return { pending, history, totalDebt };
  }, [globalData, children, activeChildId]);

  const handlePayment = async (pagoId: string) => {
    try {
      setPayingId(pagoId);
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { pago_id: pagoId }
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Error iniciando el pago. Revisa la consola.");
    } finally {
      setPayingId(null);
    }
  };

  if (appLoading) return <div className="p-10 text-brand-neon animate-pulse font-black uppercase">Cargando Finanzas...</div>;

  const activeChildName = activeChildId 
    ? (children?.find(c => c.id === activeChildId)?.nombre || "Jugador")
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      
      {/* 1. SELECTOR DE HIJOS */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setActiveChildId(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all shrink-0 ${
            !activeChildId 
              ? "bg-brand-neon text-brand-deep border-brand-neon font-bold shadow-[0_0_15px_rgba(var(--brand-neon),0.3)]" 
              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
          }`}
        >
          <Filter size={14} />
          <span className="text-xs uppercase tracking-wider">Resumen General</span>
        </button>

        {children?.map(child => (
          <button 
            key={child.id}
            onClick={() => setActiveChildId(child.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all shrink-0 ${
              activeChildId === child.id
                ? "bg-brand-neon text-brand-deep border-brand-neon font-bold shadow-[0_0_15px_rgba(var(--brand-neon),0.3)]" 
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
            }`}
          >
            <User size={14} />
            <span className="text-xs uppercase tracking-wider">{child.nombre}</span>
          </button>
        ))}
      </div>

      {/* 2. TARJETA RESUMEN */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/5 bg-[#162032]/60 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-brand-neon rounded-full blur-[120px] opacity-[0.05] pointer-events-none"></div>
        <div className="relative z-10 w-full">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
            {activeChildName ? `Deuda de ${activeChildName}` : "Deuda Total Familia"}
          </p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-5xl lg:text-6xl font-display font-black text-white tracking-tighter">
              {processedData.totalDebt.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
            </h2>
            {processedData.totalDebt > 0 ? (
              <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                Pendiente
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                Al día
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. TABS */}
      <div className="flex gap-4 border-b border-white/5 pb-1">
        <button onClick={() => setFilter('pending')} className={`pb-3 px-2 text-xs font-black uppercase tracking-widest transition-all ${filter === 'pending' ? "text-brand-neon border-b-2 border-brand-neon" : "text-slate-500 hover:text-white"}`}>
          Por Pagar ({processedData.pending.length})
        </button>
        <button onClick={() => setFilter('history')} className={`pb-3 px-2 text-xs font-black uppercase tracking-widest transition-all ${filter === 'history' ? "text-brand-neon border-b-2 border-brand-neon" : "text-slate-500 hover:text-white"}`}>
          Historial ({processedData.history.length})
        </button>
      </div>

      {/* 4. LISTADO */}
      <div className="grid gap-3">
        {filter === 'pending' && processedData.pending.map((p) => (
          <PaymentCard 
            key={p.id} 
            payment={p} 
            type="pending" 
            onPay={handlePayment} 
            isProcessing={payingId === p.id} 
          />
        ))}

        {filter === 'history' && processedData.history.map((p) => (
          <PaymentCard 
            key={p.id} 
            payment={p} 
            type="history" 
          />
        ))}

        {((filter === 'pending' && processedData.pending.length === 0) || (filter === 'history' && processedData.history.length === 0)) && (
           <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-[32px] bg-[#162032]/20 flex flex-col items-center justify-center">
             <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
               <CheckCircle size={32} className="text-emerald-500" />
             </div>
             <p className="text-white font-bold text-lg mb-1">¡Todo limpio!</p>
             <p className="text-slate-500 text-xs uppercase tracking-wider">
               {filter === 'pending' ? "No hay pagos pendientes" : "No hay historial disponible"}
             </p>
           </div>
        )}
      </div>
    </div>
  );
}

function PaymentCard({ payment, type, onPay, isProcessing }: PaymentCardProps) {
  const isPending = type === 'pending';
  
  return (
    <div className={`relative overflow-hidden border rounded-[20px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all group ${
      isPending 
        ? "bg-[#162032]/80 border-white/10 hover:border-brand-neon/30 hover:bg-[#162032]" 
        : "bg-[#162032]/40 border-white/5 opacity-60 hover:opacity-100"
    }`}>
      <div className="flex items-start gap-4 w-full">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center">
             {payment.clubLogo ? (
               <img src={payment.clubLogo} alt="Club" className="w-full h-full object-contain" />
             ) : (
               <Shield size={20} className="text-slate-600" />
             )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-brand-deep border border-white/10 rounded-full p-0.5">
             <div className="w-4 h-4 bg-brand-neon rounded-full flex items-center justify-center text-[8px] font-black text-brand-deep">
               {payment.childName.charAt(0)}
             </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] text-brand-neon font-black uppercase tracking-wider truncate">
               {payment.childName}
             </span>
             <span className="w-1 h-1 rounded-full bg-slate-700"></span>
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
               {payment.clubName}
             </span>
          </div>

          <h4 className="text-base font-bold text-white leading-tight mb-1 truncate pr-2">
            {payment.concepto}
          </h4>
          
          <div className="flex items-center gap-3 text-xs text-slate-400">
             <span className="flex items-center gap-1 truncate max-w-[120px]"><Trophy size={10} /> {payment.tournamentName || "Cuota"}</span>
             <span className={`flex items-center gap-1 ${isPending ? "text-orange-400" : "text-emerald-500"}`}>
               <Calendar size={10} /> 
               {isPending ? (payment.fecha_vencimiento || "Sin fecha") : (payment.paid_at?.slice(0,10))}
             </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0 mt-2 md:mt-0 md:pl-6 md:border-l md:border-white/5">
         <div className="text-right">
           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Total</p>
           <p className="text-lg font-black text-white">{Number(payment.importe).toFixed(2)}€</p>
         </div>

         {isPending ? (
           <button 
             onClick={() => onPay?.(payment.id)} 
             disabled={isProcessing}
             className="px-5 py-2.5 rounded-xl bg-brand-neon hover:bg-white text-brand-deep font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_15px_rgba(var(--brand-neon),0.5)] active:scale-95"
           >
             {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <CreditCard size={14} />}
             Pagar
           </button>
         ) : (
           <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
             <CheckCircle size={18} />
           </div>
         )}
      </div>
    </div>
  );
}