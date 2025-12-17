import React from 'react';
import { Trophy, Users, FileCheck, TrendingUp, AlertTriangle, ArrowUpRight, Activity } from 'lucide-react';
import { useStore } from '../../context/Store';
import { useNavigate } from 'react-router-dom';

const Overview: React.FC = () => {
  const {
  tournaments = [],
  teams = [],
  players = [],
  payments = [],
} = useStore();

  const navigate = useNavigate();

  // Calculations
  const activeTournaments = tournaments.filter(t => t.status === 'En curso' || t.status === 'Planificado').length;
  const totalTeams = teams.length;
  const validatedPlayers = players.filter(p => p.status === 'Validado').length;
  const pendingPlayers = players.filter(p => p.status === 'Pendiente').length;
  const totalPlayers = players.length || 1;
  const docPercentage = Math.round((validatedPlayers / totalPlayers) * 100);
  
  const totalPaymentsAmount = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const collectedPayments = payments.filter(p => p.status === 'Pagado').reduce((acc, curr) => acc + curr.amount, 0);
  const paymentPercentage = totalPaymentsAmount > 0 ? Math.round((collectedPayments / totalPaymentsAmount) * 100) : 0;

  const KPICard = ({ label, value, subtext, icon: Icon, colorClass, borderClass }: any) => (
      <div className={`bg-brand-surface border ${borderClass} p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Icon size={100} />
          </div>
          <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}>
                      <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
              </div>
              <div className="text-4xl font-display font-black text-white italic mb-2">{value}</div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="text-brand-neon flex items-center gap-1 bg-brand-neon/10 px-1.5 py-0.5 rounded">
                      <Activity size={12} /> Live
                  </span>
                  {subtext}
              </div>
          </div>
      </div>
  );

  return (
    <div className="space-y-8 animate-slide-up">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
            label="Torneos Activos" 
            value={activeTournaments} 
            subtext="Operaciones en curso" 
            icon={Trophy} 
            colorClass="bg-blue-600 text-blue-400"
            borderClass="border-blue-500/20"
        />
        <KPICard 
            label="Equipos Totales" 
            value={totalTeams} 
            subtext={`${teams.length} clubs registrados`} 
            icon={Users} 
            colorClass="bg-purple-600 text-purple-400"
            borderClass="border-purple-500/20"
        />
        <KPICard 
            label="Docs Validados" 
            value={`${docPercentage}%`} 
            subtext={`${pendingPlayers} pendientes revisión`} 
            icon={FileCheck} 
            colorClass="bg-brand-neon text-brand-neon"
            borderClass="border-brand-neon/30 shadow-neon"
        />
        <KPICard 
            label="Facturación" 
            value={`€${(collectedPayments/1000).toFixed(1)}k`} 
            subtext={`${paymentPercentage}% del objetivo`} 
            icon={TrendingUp} 
            colorClass="bg-emerald-600 text-emerald-400"
            borderClass="border-emerald-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Status Board */}
        <div className="lg:col-span-2 bg-brand-surface border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-carbon opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-display font-bold text-white italic uppercase">Estado de Torneos</h3>
                    <p className="text-slate-500 text-xs font-medium mt-1">Monitorización en tiempo real</p>
                </div>
                <button onClick={() => navigate('/dashboard/tournaments')} className="text-xs font-bold text-brand-neon hover:text-white uppercase tracking-wider border border-brand-neon/30 hover:bg-brand-neon/10 px-4 py-2 rounded-lg transition-all">
                    Ver todos
                </button>
            </div>
          
            <div className="space-y-4">
                {tournaments.slice(0, 5).map((tourney) => {
                const isUrgent = tourney.status === 'Urgente';
                const isLive = tourney.status === 'En curso';
                let progress = isLive ? 75 : isUrgent ? 45 : tourney.status === 'Finalizado' ? 100 : 20;

                return (
                    <div key={tourney.id} className="group bg-brand-deep/80 p-5 rounded-xl border border-white/5 hover:border-brand-neon/30 transition-all hover:translate-x-1">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                        <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-xl shadow-lg skew-x-[-6deg] ${isUrgent ? 'bg-red-500 text-brand-deep' : isLive ? 'bg-brand-neon text-brand-deep' : 'bg-blue-600 text-white'}`}>
                            {tourney.name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-white text-base uppercase italic tracking-wide">{tourney.name}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{tourney.city} • {tourney.dates}</div>
                        </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${
                                isLive ? 'bg-brand-neon/10 text-brand-neon border-brand-neon/20' :
                                isUrgent ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                            {tourney.status}
                            </span>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative pt-2">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">
                            <span>Progreso Logística</span>
                            <span className={isUrgent ? 'text-red-400' : 'text-brand-neon'}>{progress}%</span>
                        </div>
                        <div className="w-full bg-brand-deep h-2 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 relative ${isUrgent ? 'bg-red-500' : 'bg-brand-neon'}`} 
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                    </div>
                )
                })}
                {tournaments.length === 0 && <div className="text-center py-10 text-slate-500">No data available</div>}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
            
            {/* Action Center */}
            <div className="bg-brand-surface border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-neon rounded-full"></div>
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => navigate('/dashboard/tournaments')} className="p-4 bg-brand-deep/50 border border-white/5 rounded-xl hover:bg-brand-neon hover:text-brand-deep hover:border-transparent transition-all group flex flex-col items-center gap-2 text-center">
                        <Trophy size={20} className="text-slate-400 group-hover:text-brand-deep" />
                        <span className="text-xs font-bold uppercase tracking-wide">Torneo</span>
                    </button>
                    <button onClick={() => navigate('/dashboard/teams')} className="p-4 bg-brand-deep/50 border border-white/5 rounded-xl hover:bg-brand-neon hover:text-brand-deep hover:border-transparent transition-all group flex flex-col items-center gap-2 text-center">
                        <Users size={20} className="text-slate-400 group-hover:text-brand-deep" />
                        <span className="text-xs font-bold uppercase tracking-wide">Equipo</span>
                    </button>
                    <button onClick={() => navigate('/dashboard/documentation')} className="p-4 bg-brand-deep/50 border border-white/5 rounded-xl hover:bg-brand-neon hover:text-brand-deep hover:border-transparent transition-all group flex flex-col items-center gap-2 text-center relative">
                        {pendingPlayers > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        <FileCheck size={20} className="text-slate-400 group-hover:text-brand-deep" />
                        <span className="text-xs font-bold uppercase tracking-wide">Docs</span>
                    </button>
                     <button onClick={() => navigate('/dashboard/payments')} className="p-4 bg-brand-deep/50 border border-white/5 rounded-xl hover:bg-brand-neon hover:text-brand-deep hover:border-transparent transition-all group flex flex-col items-center gap-2 text-center">
                        <TrendingUp size={20} className="text-slate-400 group-hover:text-brand-deep" />
                        <span className="text-xs font-bold uppercase tracking-wide">Pagos</span>
                    </button>
                </div>
            </div>

            {/* System Alerts */}
            <div className="bg-brand-deep border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <AlertTriangle size={60} />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 relative z-10">Alertas</h3>
                <div className="space-y-3 relative z-10">
                   {pendingPlayers > 0 && (
                     <div className="flex gap-3 p-3 bg-brand-surface border-l-2 border-brand-neon rounded-r-lg">
                        <div>
                            <div className="text-sm text-brand-neon font-bold">Documentación</div>
                            <div className="text-xs text-slate-400">{pendingPlayers} jugadores pendientes de validar.</div>
                        </div>
                    </div>
                   )}
                   {payments.some(p => p.status === 'Vencido') && (
                     <div className="flex gap-3 p-3 bg-red-950/30 border-l-2 border-red-500 rounded-r-lg">
                        <div>
                            <div className="text-sm text-red-400 font-bold">Pagos Vencidos</div>
                            <div className="text-xs text-red-300/70">Revisar sección financiera urgente.</div>
                        </div>
                    </div>
                   )}
                   {pendingPlayers === 0 && !payments.some(p => p.status === 'Vencido') && (
                      <div className="text-sm text-slate-500 italic py-2">Sistemas nominales. Sin alertas.</div>
                   )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Overview;