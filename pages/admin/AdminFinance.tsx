import { DollarSign, ArrowUpRight, TrendingUp, CreditCard } from "lucide-react";

export default function AdminFinance() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-display font-black tracking-tighter italic text-white uppercase">Facturación SaaS</h1>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Control de ingresos por comisiones y suscripciones</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[32px]">
          <DollarSign className="text-emerald-500 mb-4" size={32} />
          <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">Recaudación Total</p>
          <h3 className="text-4xl font-display font-black text-white">128,450.00€</h3>
        </div>
        <div className="bg-[#162032]/40 border border-white/5 p-8 rounded-[32px]">
          <TrendingUp className="text-brand-neon mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tu Comisión (SaaS)</p>
          <h3 className="text-4xl font-display font-black text-white">1,926.75€</h3>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-[32px]">
          <CreditCard className="text-blue-500 mb-4" size={32} />
          <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.2em]">Pagos con SEPA</p>
          <h3 className="text-4xl font-display font-black text-white">42 Operaciones</h3>
        </div>
      </div>

      {/* Aquí podrías añadir una tabla con los últimos movimientos de Stripe de todos los clubes */}
    </div>
  );
}