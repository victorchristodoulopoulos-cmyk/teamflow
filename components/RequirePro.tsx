import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { getMyClubContext } from "../supabase/clubService";
import { Lock, Zap, CheckCircle2, Crown, ChevronRight, Map, Building, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RequirePro({ children, featureName = "Premium" }: { children: React.ReactNode, featureName?: string }) {
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkPlan() {
      try {
        const { club_id } = await getMyClubContext();
        const { data } = await supabase.from("clubs").select("plan").eq("id", club_id).single();
        // Si no existe la columna o está vacía, asumimos 'free'
        if (data && data.plan) {
          setPlan(data.plan);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    checkPlan();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si es PRO (o super admin que quieras incluir), enseñamos el contenido
  if (plan === "pro") {
    return <>{children}</>;
  }

  // SI ES FREE, ENSEÑAMOS EL PAYWALL
  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in zoom-in-95 duration-500">
      
      {/* HEADER DEL PAYWALL */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-neon/10 text-brand-neon mb-6 border border-brand-neon/20 shadow-[0_0_40px_rgba(var(--brand-neon-rgb),0.2)]">
          <Lock size={32} />
        </div>
        <p className="text-brand-neon text-[10px] font-black uppercase tracking-[0.3em] mb-2">Acceso Restringido</p>
        <h2 className="text-4xl md:text-5xl font-display font-black text-white italic tracking-tighter uppercase mb-4">
          Módulo {featureName}
        </h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Esta herramienta está reservada para clubes con el plan TeamFlow PRO. Pasa al siguiente nivel y desbloquea el potencial de tu club.
        </p>
      </div>

      {/* TARJETA DE PRECIOS */}
      <div className="bg-[#162032] border border-brand-neon/30 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/10 rounded-full blur-[80px]"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Lado Izquierdo: Funcionalidades */}
          <div>
            <h3 className="text-2xl font-black text-white uppercase italic mb-6 flex items-center gap-2">
              <Crown className="text-brand-neon" size={24}/> Plan Pro
            </h3>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-brand-neon shrink-0 mt-0.5" size={20}/>
                <p className="text-slate-300 font-medium">Gestión completa de <strong className="text-white">Stages y Viajes</strong>.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-brand-neon shrink-0 mt-0.5" size={20}/>
                <p className="text-slate-300 font-medium">Motor de <strong className="text-white">Pagos y Recibos</strong> ilimitado.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-brand-neon shrink-0 mt-0.5" size={20}/>
                <p className="text-slate-300 font-medium">Logística avanzada: <strong className="text-white">Vuelos, Hoteles y Rooming</strong>.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-brand-neon shrink-0 mt-0.5" size={20}/>
                <p className="text-slate-300 font-medium">Soporte prioritario 24/7.</p>
              </li>
            </ul>
          </div>

          {/* Lado Derecho: Call to Action */}
          <div className="bg-[#0D1B2A] rounded-[32px] p-8 border border-white/5 text-center flex flex-col justify-center h-full">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Suscripción Mensual</p>
            <div className="flex justify-center items-end gap-1 mb-6">
              <span className="text-5xl font-display font-black text-white tracking-tighter">20</span>
              <span className="text-xl font-bold text-slate-500 mb-1">€/mes</span>
            </div>
            
            <button 
              onClick={() => alert("¡Aquí iría el Checkout de Stripe para Suscripciones!")}
              className="w-full py-4 rounded-2xl bg-brand-neon text-[#0D1B2A] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(var(--brand-neon-rgb),0.4)]"
            >
              <Zap size={18} /> Mejorar a PRO
            </button>
            <p className="text-[9px] text-slate-500 mt-4 uppercase tracking-widest">Cancela cuando quieras.</p>
          </div>
        </div>
      </div>
    </div>
  );
}