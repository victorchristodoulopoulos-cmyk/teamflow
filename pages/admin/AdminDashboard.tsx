import { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { Shield, Users, Trophy, DollarSign, Activity, AlertCircle, ArrowUpRight, TrendingUp, RefreshCcw, Database } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clubs: 0,
    players: 0,
    tournaments: 0,
    revenue: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const fetchGlobalStats = async () => {
    setLoading(true);
    // Ejecutamos conteos en paralelo para máxima eficiencia
    const [clubsRes, playersRes, tournamentsRes, revenueRes, pendingRes] = await Promise.all([
      supabase.from('clubs').select('*', { count: 'exact', head: true }),
      supabase.from('jugadores').select('*', { count: 'exact', head: true }),
      supabase.from('torneos').select('*', { count: 'exact', head: true }),
      supabase.from('pagos').select('importe').eq('estado', 'pagado'),
      supabase.from('pagos').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente')
    ]);

    const totalRevenue = revenueRes.data?.reduce((acc, curr) => acc + (curr.importe || 0), 0) || 0;

    setStats({
      clubs: clubsRes.count || 0,
      players: playersRes.count || 0,
      tournaments: tournamentsRes.count || 0,
      revenue: totalRevenue,
      pendingPayments: pendingRes.count || 0
    });

    // Feed de actividad simulado (puedes conectarlo a una tabla de logs real después)
    setRecentActivity([
      { id: 1, type: 'payment', msg: 'Nuevo pago de 150€ verificado', time: 'Justo ahora', color: 'text-emerald-400' },
      { id: 2, type: 'club', msg: 'Elite Basket Madrid ha actualizado su logo', time: 'hace 12 min', color: 'text-blue-400' },
      { id: 3, type: 'player', msg: 'Inscripción masiva: 42 nuevos jugadores', time: 'hace 1h', color: 'text-brand-neon' },
    ]);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const cards = [
    { label: "Partner Clubs", value: stats.clubs, icon: <Shield size={20}/>, color: "text-blue-400", trend: "SaaS Activos" },
    { label: "Database Players", value: stats.players.toLocaleString(), icon: <Users size={20}/>, color: "text-brand-neon", trend: "Crecimiento Global" },
    { label: "Active Events", value: stats.tournaments, icon: <Trophy size={20}/>, color: "text-orange-400", trend: "En preparación" },
    { label: "Total Volume", value: `${stats.revenue.toLocaleString()}€`, icon: <DollarSign size={20}/>, color: "text-emerald-400", trend: "Transaccionado" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-8 h-8 rounded-lg bg-brand-neon flex items-center justify-center">
                <TrendingUp size={18} className="text-black" />
             </div>
             <h1 className="text-5xl font-display font-black tracking-tighter italic text-white uppercase leading-none">Command Center</h1>
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-neon animate-pulse"></span>
            Monitorizando infraestructura TeamFlow Cloud
          </p>
        </div>
        <button 
            onClick={fetchGlobalStats}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-brand-neon hover:text-black transition-all"
        >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Refrescar Engine
        </button>
      </header>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat, i) => (
          <div key={i} className="group relative overflow-hidden bg-[#162032]/30 border border-white/5 p-8 rounded-[40px] hover:border-brand-neon/30 transition-all">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-brand-neon/10 transition-colors"></div>
            <div className={`p-4 rounded-2xl bg-black/40 border border-white/5 w-fit mb-8 group-hover:scale-110 transition-transform duration-500 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <h3 className="text-4xl font-display font-black text-white italic">{loading ? "---" : stat.value}</h3>
            <div className="flex items-center gap-2 mt-4">
                <ArrowUpRight size={12} className="text-brand-neon" />
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LIVE SYSTEM LOGS */}
        <div className="lg:col-span-2 bg-black/40 border border-white/5 rounded-[48px] p-10 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-neon/50 to-transparent"></div>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
                <Activity size={20} className="text-brand-neon" />
                <h3 className="text-xl font-display font-black italic uppercase tracking-tight">System Live Feed</h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-brand-neon/10 border border-brand-neon/20 text-[9px] font-black text-brand-neon uppercase tracking-widest">Real-time</div>
          </div>
          
          <div className="space-y-6">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-5 rounded-3xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 transition-all group">
                <div className="flex items-center gap-6">
                  <div className={`w-1.5 h-1.5 rounded-full bg-current ${item.color} shadow-[0_0_10px_currentColor]`}></div>
                  <div>
                    <p className="text-[13px] font-bold text-white group-hover:text-brand-neon transition-colors">{item.msg}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Source: Main_Relay_01</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase italic bg-black/40 px-3 py-1 rounded-lg">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECURITY & ALERTS */}
        <div className="flex flex-col gap-6">
            <div className="bg-red-500/5 border border-red-500/10 rounded-[40px] p-10 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8 text-red-500">
                        <AlertCircle size={28} className="animate-bounce" />
                        <h3 className="text-2xl font-display font-black italic uppercase leading-none tracking-tighter">Alertas Core</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-6 rounded-[28px] bg-black/60 border border-red-500/20 group hover:border-red-500/50 transition-all cursor-pointer">
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Billing Issue</p>
                            <p className="text-[13px] font-bold text-white leading-tight">Hay <span className="text-red-500">{stats.pendingPayments}</span> facturas que han superado el tiempo límite de pago.</p>
                            <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase text-slate-500">
                                <RefreshCcw size={10} /> Auto-resolving in 4h
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-brand-neon border border-black p-10 rounded-[40px] flex flex-col justify-between h-full group cursor-pointer overflow-hidden relative">
                <Database size={100} className="absolute -bottom-10 -right-10 text-black/10 group-hover:scale-125 transition-transform duration-700" />
                <h4 className="text-black font-black uppercase italic text-2xl leading-none tracking-tighter mb-4">Exportar<br/>Base Datos</h4>
                <p className="text-black/60 text-[11px] font-bold uppercase leading-tight mb-8">Backup integral de toda la plataforma en formato JSON/CSV</p>
                <button className="w-fit bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:px-10 transition-all">Iniciar Dump</button>
            </div>
        </div>
      </div>
    </div>
  );
}