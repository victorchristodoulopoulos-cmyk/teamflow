import React from 'react';
import { useStore } from '../../context/Store';
import { Hotel, Bus, MapPin, Calendar, Clock, Plane } from 'lucide-react';

const TeamLogistics: React.FC = () => {
  const { user, teams, tournaments, hotels, transport } = useStore();

  const myTeam = teams.find(t => t.id === user?.teamId);
  const myTournament = tournaments.find(t => t.id === myTeam?.tournamentId);
  const myHotel = hotels.find(h => h.id === myTournament?.hotelId);
  const myTransport = transport.find(t => t.id === myTournament?.transportId);

  if (!myTeam) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-white">Tu Viaje</h1>
            <p className="text-slate-400 text-sm">Información de alojamiento y desplazamientos asignados.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Hotel Section */}
            <div className="bg-brand-surface border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                <div className="h-48 bg-slate-800 relative">
                     {myHotel ? (
                        <img src={myHotel.image} className="w-full h-full object-cover opacity-80" alt="Hotel" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                            <Hotel size={48} />
                        </div>
                     )}
                     <div className="absolute top-4 left-4 bg-brand-deep/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-2">
                         <Hotel size={14} className="text-brand-neon" /> Alojamiento
                     </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                    {myHotel ? (
                        <>
                            <h2 className="text-xl font-bold text-white mb-2">{myHotel.name}</h2>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                                <MapPin size={16} /> {myHotel.city}
                            </div>
                            
                            <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Estado</span>
                                    <span className="text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded text-xs">Confirmado</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Habitaciones</span>
                                    <span className="text-white font-medium">{Math.ceil(20 / 2)} (Estimado)</span>
                                </div>
                            </div>
                        </>
                    ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                            <p className="text-slate-400 mb-2">Alojamiento aún no asignado.</p>
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full">Pendiente de gestión</span>
                         </div>
                    )}
                </div>
            </div>

            {/* Transport Section */}
            <div className="bg-brand-surface border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                 <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
                     <div className="text-slate-600">
                        {myTransport?.type === 'Avión' ? <Plane size={64} /> : <Bus size={64} />}
                     </div>
                     <div className="absolute top-4 left-4 bg-brand-deep/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-2">
                         <Bus size={14} className="text-brand-neon" /> Transporte
                     </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    {myTransport ? (
                         <>
                            <h2 className="text-xl font-bold text-white mb-1">{myTransport.company}</h2>
                            <p className="text-slate-400 text-sm mb-6">{myTransport.type} desde {myTransport.departureCity}</p>
                            
                            <div className="mt-auto space-y-4">
                                <div className="flex items-center gap-4 bg-brand-deep/50 p-4 rounded-xl border border-white/5">
                                    <div className="text-center">
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Salida</div>
                                        <div className="text-white font-mono text-lg">{myTransport.departureTime}</div>
                                    </div>
                                    <div className="flex-1 border-t-2 border-dashed border-slate-600 relative">
                                        <div className="absolute -top-1.5 right-0 w-3 h-3 bg-slate-600 rounded-full"></div>
                                        <div className="absolute -top-1.5 left-0 w-3 h-3 bg-brand-neon rounded-full shadow-[0_0_10px_rgba(201,255,47,0.5)]"></div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Llegada</div>
                                        <div className="text-white font-mono text-lg">--:--</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                            <p className="text-slate-400 mb-2">Transporte aún no asignado.</p>
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full">Pendiente de gestión</span>
                         </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default TeamLogistics;