import { Shield, Users, Trophy, DollarSign, Activity, ArrowUpRight, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Clientes (Clubes)", value: "24", icon: <Shield size={20}/>, color: "text-blue-400", trend: "+2 este mes" },
    { label: "Jugadores Activos", value: "3,150", icon: <Users size={20}/>, color: "text-brand-neon", trend: "+12%" },
    { label: "Eventos Globales", value: "8", icon: <Trophy size={20}/>, color: "text-orange-400", trend: "4 en preparación" },
    { label: "Ingresos SaaS", value: "12,450€", icon: <DollarSign size={20}/>, color: "text-emerald-400", trend: "MRR Actual" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display font-black tracking-tighter italic text-white uppercase leading-none">Command Center</h1>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-neon animate-pulse"></span>
            Sistema Operativo TeamFlow v2.0
          </p>
        </div>
      </header>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group bg-[#162032]/40 border border-white/5 p-8 rounded-[32px] hover:bg-[#162032]/60 hover:border-white/10 transition-all cursor-default">
            <div className={`p-4 rounded-2xl bg-white/5 w-fit mb-6 group-hover:scale-110 transition-transform ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-display font-black text-white">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-600 mt-2 uppercase tracking-tighter">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LOGS DE ACTIVIDAD */}
        <div className="lg:col-span-2 bg-[#162032]/20 border border-white/5 rounded-[40px] p-10 backdrop-blur-md">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-display font-black italic uppercase flex items-center gap-3">
              <Activity size={20} className="text-brand-neon" />
              Live System Feed
            </h3>
            <button className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Ver todos</button>
          </div>
          
          <div className="space-y-8">
            <ActivityItem club="Elite Basket Madrid" event="Nuevo torneo creado" time="2 min" color="bg-orange-500" />
            <ActivityItem club="S.D. Compostela" event="Pago verificado (240.00€)" time="15 min" color="bg-emerald-500" />
            <ActivityItem club="Atleti Academia" event="14 nuevos jugadores inscritos" time="1h" color="bg-blue-500" />
          </div>
        </div>

        {/* ALERTAS DE NEGOCIO */}
        <div className="bg-red-500/5 border border-red-500/10 rounded-[40px] p-10">
           <div className="flex items-center gap-3 mb-8 text-red-500">
              <AlertCircle size={24} />
              <h3 className="text-xl font-display font-black italic uppercase leading-none">Alertas</h3>
           </div>
           <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-black/40 border border-red-500/20">
                 <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Pagos Pendientes</p>
                 <p className="text-sm font-bold text-white leading-tight">3 transferencias SEPA necesitan validación manual en el Club Deportivo X.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ club, event, time, color }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-5">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <div>
          <p className="text-sm font-bold text-white group-hover:text-brand-neon transition-colors">{club}</p>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{event}</p>
        </div>
      </div>
      <span className="text-[10px] font-black text-slate-600 uppercase italic">{time} ago</span>
    </div>
  );
}