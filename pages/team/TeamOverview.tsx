import React from 'react';
import { useStore } from '../../context/Store';
import { Trophy, CalendarClock, MapPin, Users, CheckCircle2, AlertCircle, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeamOverview: React.FC = () => {
  const { user, tournaments, teams, players } = useStore();
  const navigate = useNavigate();

  // Filter Data for this Team
  const myTeam = teams.find(t => t.id === user?.teamId);
  const myTournament = tournaments.find(t => t.id === myTeam?.tournamentId);
  const myPlayers = players.filter(p => p.teamId === user?.teamId);

  // Stats
  const validatedCount = myPlayers.filter(p => p.status === 'Validado').length;
  const pendingCount = myPlayers.length - validatedCount;
  const completion = myPlayers.length > 0 ? Math.round((validatedCount / myPlayers.length) * 100) : 0;
  
  // Checklist Logic
  const checklist = [
    { label: 'Plantilla Definida (>10 jugadores)', done: myPlayers.length >= 10 },
    { label: 'Documentación Completada', done: completion === 100 && myPlayers.length > 0 },
    { label: 'Hotel Asignado', done: !!myTournament?.hotelId },
    { label: 'Transporte Confirmado', done: !!myTournament?.transportId },
  ];
  
  const allReady = checklist.every(i => i.done);

  if (!myTeam) return <div className="text-white p-8">Error: No se encontró información del equipo.</div>;

  return (
    <div className="space-y-6 animate-slide-up">
       {/* Welcome Banner */}
       <div className="bg-gradient-to-r from-blue-700 to-brand-deep rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-white/10">
          <div className="absolute inset-0 bg-carbon opacity-30 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">Team Portal v2.0</div>
                <h1 className="text-3xl md:text-5xl font-display font-black italic uppercase mb-2">Hola, {myTeam.name}</h1>
                <p className="text-blue-200 max-w-xl text-lg font-medium">Panel de control logístico. Tu objetivo es completar el checklist antes del viaje.</p>
              </div>
              
              {allReady ? (
                 <div className="bg-brand-neon text-brand-deep px-6 py-3 rounded-xl font-black uppercase tracking-wider shadow-neon transform rotate-2">
                    ¡Listos para Viajar! 🚀
                 </div>
              ) : (
                 <div className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider shadow-lg transform -rotate-1 animate-pulse">
                    Acciones Pendientes
                 </div>
              )}
          </div>
       </div>

       {/* Tournament Status Card */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-brand-surface border border-white/5 rounded-2xl p-6 relative group overflow-hidden hover:border-brand-neon/30 transition-all">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy size={180} />
                 </div>
                 
                 <div className="relative z-10">
                    <div className="text-brand-neon text-xs font-bold uppercase tracking-widest mb-1">Próximo Torneo</div>
                    <h2 className="text-4xl font-display font-black text-white italic mb-8">{myTournament ? myTournament.name : "Torneo no asignado"}</h2>

                    {myTournament ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-brand-deep/50 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                                <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400">
                                    <CalendarClock size={24} />
                                </div>
                                <div>
                                    <div className="text-slate-400 text-xs font-bold uppercase">Fechas</div>
                                    <div className="text-white font-bold text-lg">{myTournament.dates}</div>
                                </div>
                            </div>
                             <div className="bg-brand-deep/50 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                                <div className="bg-purple-500/20 p-3 rounded-lg text-purple-400">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <div className="text-slate-400 text-xs font-bold uppercase">Sede</div>
                                    <div className="text-white font-bold text-lg">{myTournament.city}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                            Contacta con administración para asignación.
                        </div>
                    )}
                 </div>
            </div>

            {/* Checklist */}
             <div className="bg-brand-surface border border-white/5 rounded-2xl p-6 flex flex-col">
                 <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
                    <ListChecks size={24} className="text-brand-neon" /> Checklist Final
                 </h3>
                 <div className="space-y-4 flex-1">
                     {checklist.map((item, idx) => (
                         <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-brand-deep/30 border border-white/5">
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${item.done ? 'bg-brand-neon border-brand-neon text-brand-deep' : 'bg-transparent border-slate-600 text-transparent'}`}>
                                 <CheckCircle2 size={16} />
                             </div>
                             <span className={`text-sm font-medium ${item.done ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
                         </div>
                     ))}
                 </div>
                 <div className="mt-6 pt-4 border-t border-white/5">
                     <button onClick={() => navigate('/team/roster')} className="w-full py-3 bg-white/5 hover:bg-brand-neon hover:text-brand-deep text-white font-bold rounded-xl transition-all uppercase text-xs tracking-wider">
                         Gestionar Documentación
                     </button>
                 </div>
             </div>
       </div>
    </div>
  );
};

export default TeamOverview;