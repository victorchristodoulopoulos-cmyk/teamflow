import { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { BarChart3, Users, Shield, DollarSign, TrendingUp, Loader2 } from "lucide-react";

export default function AdminAnalytics() {
  const [data, setData] = useState({ clubs: 0, players: 0, revenue: 0, loading: true });

  useEffect(() => {
    const fetchAnalytics = async () => {
      // 1. Contar filas reales en cada tabla
      const { count: clubCount } = await supabase.from('clubs').select('*', { count: 'exact', head: true });
      const { count: playerCount } = await supabase.from('jugadores').select('*', { count: 'exact', head: true });
      const { data: payments } = await supabase.from('pagos').select('importe').eq('estado', 'pagado');
      
      const totalRevenue = payments?.reduce((acc, curr) => acc + Number(curr.importe), 0) || 0;

      setData({
        clubs: clubCount || 0,
        players: playerCount || 0,
        revenue: totalRevenue,
        loading: false
      });
    };
    fetchAnalytics();
  }, []);

  if (data.loading) return <div className="h-full flex items-center justify-center animate-pulse"><Loader2 className="text-brand-neon animate-spin" size={40} /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-display font-black tracking-tighter italic text-white uppercase leading-none">Platform Analytics</h1>
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mt-3">Datos consolidados de la base de datos</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AnalyticCard icon={<Shield/>} label="Clubes en Red" value={data.clubs} color="text-blue-400" />
        <AnalyticCard icon={<Users/>} label="Jugadores Totales" value={data.players} color="text-brand-neon" />
        <AnalyticCard icon={<DollarSign/>} label="Volumen de Pagos" value={`${data.revenue.toLocaleString()}€`} color="text-emerald-400" />
      </div>

      <div className="bg-[#162032]/40 border border-white/5 p-10 rounded-[40px]">
        <h3 className="text-xl font-bold flex items-center gap-3 mb-10 uppercase italic">
          <TrendingUp className="text-brand-neon" /> Actividad Reciente
        </h3>
        {/* Aquí puedes mantener el gráfico de barras CSS anterior */}
      </div>
    </div>
  );
}

function AnalyticCard({ icon, label, value, color }: any) {
    return (
        <div className="bg-[#162032]/40 border border-white/5 p-10 rounded-[40px] hover:bg-[#162032]/60 transition-all">
            <div className={`p-4 rounded-2xl bg-white/5 w-fit mb-6 ${color}`}>{icon}</div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-4xl font-display font-black text-white">{value}</h4>
        </div>
    )
}