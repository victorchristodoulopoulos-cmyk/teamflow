import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Wallet, Settings, Building2, CheckCircle2, Clock, MoreHorizontal, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import TournamentPricingConfig from "./TournamentPricingConfig"; // 🔥 Importamos el componente modal

export default function TournamentSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<any[]>([]);
  const [showConfig, setShowConfig] = useState(false); // Estado para abrir el modal

  // Stats
  const totalEsperado = clubs.reduce((acc, c) => acc + (c.total_a_pagar || 0), 0);
  const totalRecaudado = clubs.reduce((acc, c) => acc + (c.total_pagado || 0), 0);
  const pendiente = totalEsperado - totalRecaudado;

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("torneo_id").eq("id", user.id).single();
      if (profile) {
        const { data } = await supabase
          .from("inscripciones_torneo")
          .select("*")
          .eq("torneo_id", profile.torneo_id)
          .order("nombre_club");
        if (data) setClubs(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [showConfig]); // Recargamos si cerramos la config por si cambiaron precios

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      
      {/* HEADER FINANCIERO */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-[#162032] border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/20 mb-4">
            <Wallet size={12} /> Control Financiero
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
            Pagos
          </h1>
          <div className="flex gap-8 mt-6">
            <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Facturado</p><p className="text-3xl font-black text-white">{totalEsperado.toLocaleString()}€</p></div>
            <div className="w-px h-10 bg-white/10"></div>
            <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cobrado</p><p className="text-3xl font-black text-green-500">{totalRecaudado.toLocaleString()}€</p></div>
            <div className="w-px h-10 bg-white/10"></div>
            <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pendiente</p><p className="text-3xl font-black text-red-400">{pendiente.toLocaleString()}€</p></div>
          </div>
        </div>
        <div className="relative z-10">
          {/* BOTÓN PARA ABRIR LA CONFIGURACIÓN */}
          <button onClick={() => setShowConfig(true)} className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-black/40 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest hover:border-emerald-500/50 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-brand-deep transition-colors"><Settings size={16} /></div>
            Configurar Precios
          </button>
        </div>
      </div>

      {/* TABLA DE DEUDAS */}
      <div className="bg-[#162032]/80 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Club</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Origen</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right">Total</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right">Pagado</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-center">Estado</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clubs.map((club) => {
              const deuda = club.total_a_pagar || 0;
              const pagado = club.total_pagado || 0;
              const resta = deuda - pagado;
              
              return (
                <tr key={club.id} onClick={() => navigate(`/tournament-dashboard/pagos/club/${club.id}`)} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase text-sm">{club.nombre_club}</p>
                        <p className="text-[10px] text-slate-500">{club.email_responsable}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {/* 🔥 LOGO IDENTIFICADOR TEAMFLOW VS EXTERNO */}
                    {club.es_club_teamflow ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase border border-blue-500/20">
                        <ShieldCheck size={12} /> TeamFlow
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase border border-slate-500/20">
                        <FileText size={12} /> Externo
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right font-mono text-white opacity-60">{deuda}€</td>
                  <td className="px-8 py-5 text-right font-mono text-green-400">{pagado}€</td>
                  <td className="px-8 py-5 text-center">
                    {resta <= 0 && deuda > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[9px] font-black uppercase tracking-widest border border-green-500/20"><CheckCircle2 size={10} /> Al corriente</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[9px] font-black uppercase tracking-widest border border-orange-500/20"><Clock size={10} /> Pendiente</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <ArrowRight className="text-slate-600 group-hover:text-white transition-colors" size={18} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 🔥 AQUÍ CARGAMOS EL MODAL SI showConfig ES TRUE */}
      {showConfig && <TournamentPricingConfig onClose={() => setShowConfig(false)} />}
    </div>
  );
}