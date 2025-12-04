import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingPage: React.FC = () => {
  return (
    <div className="bg-brand-deep min-h-screen">
       <div className="bg-brand-surface py-20 border-b border-white/5">
         <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-display font-black text-white italic uppercase mb-6">
               Planes de <span className="text-brand-neon">Gestión</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
               Flexibilidad total. Paga solo por lo que necesitas o contrata un pack de temporada.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-6 py-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            
            {/* Basic Plan */}
            <div className="bg-brand-surface border border-white/5 rounded-2xl p-8 hover:border-white/20 transition-all">
                <h3 className="text-xl font-bold text-white mb-2">Por Evento</h3>
                <p className="text-slate-400 text-sm mb-6">Para clubes con viajes puntuales.</p>
                <div className="text-3xl font-display font-bold text-white mb-8">Consultar</div>
                
                <ul className="space-y-4 mb-8">
                    {['Gestión de inscripción', 'Reserva de Hotel y Bus', 'App para el equipo', 'Soporte remoto'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                            <Check size={16} className="text-brand-neon" /> {item}
                        </li>
                    ))}
                </ul>
                <Link to="/contacto" className="block w-full py-3 border border-white/20 text-white text-center font-bold rounded-xl hover:bg-white hover:text-brand-deep transition-colors">
                    Solicitar
                </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-brand-surface border-2 border-brand-neon rounded-2xl p-8 relative transform md:-translate-y-6 shadow-neon-strong">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-neon text-brand-deep px-4 py-1 rounded font-bold text-xs uppercase tracking-wider">
                    Recomendado
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 italic">Temporada Pro</h3>
                <p className="text-slate-400 text-sm mb-6">Externalización completa anual.</p>
                <div className="text-4xl font-display font-bold text-brand-neon mb-8">A medida</div>
                
                <ul className="space-y-4 mb-8">
                    {['Torneos Ilimitados', 'Gestor dedicado 24/7', 'Gestión documental completa', 'Negociación de tarifas grupo', 'Informes a directiva'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-white font-medium text-sm">
                            <div className="bg-brand-neon rounded-full p-0.5"><Check size={12} className="text-brand-deep" /></div> {item}
                        </li>
                    ))}
                </ul>
                <Link to="/contacto" className="block w-full py-4 bg-brand-neon text-brand-deep text-center font-black uppercase tracking-wider rounded-xl hover:bg-white transition-colors">
                    Agendar Reunión
                </Link>
            </div>

             {/* Enterprise Plan */}
            <div className="bg-brand-surface border border-white/5 rounded-2xl p-8 hover:border-white/20 transition-all">
                <h3 className="text-xl font-bold text-white mb-2">Elite / Internacional</h3>
                <p className="text-slate-400 text-sm mb-6">Para giras internacionales.</p>
                <div className="text-3xl font-display font-bold text-white mb-8">Consultar</div>
                
                <ul className="space-y-4 mb-8">
                    {['Logística de vuelos', 'Visados y aduanas', 'Staff bilingüe in-situ', 'Seguros internacionales'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                            <Check size={16} className="text-blue-400" /> {item}
                        </li>
                    ))}
                </ul>
                <Link to="/contacto" className="block w-full py-3 border border-white/20 text-white text-center font-bold rounded-xl hover:bg-white hover:text-brand-deep transition-colors">
                    Solicitar
                </Link>
            </div>

         </div>
      </div>
    </div>
  );
};

export default PricingPage;