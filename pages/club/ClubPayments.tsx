import { CreditCard } from "lucide-react";

export default function ClubPayments() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 rounded-3xl border border-white/5 bg-[#162032]/20 border-dashed">
      <div className="w-20 h-20 rounded-full bg-[#162032] flex items-center justify-center mb-6">
        <CreditCard size={40} className="text-slate-600" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Finanzas del Club</h2>
      <p className="text-slate-400 max-w-md mx-auto">
        Panel de control para gestionar cuotas de jugadores, pagos a torneos y balance general.
      </p>
       <button disabled className="mt-8 px-6 py-3 rounded-xl bg-white/5 text-slate-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed">
        Módulo en Desarrollo
      </button>
    </div>
  );
}