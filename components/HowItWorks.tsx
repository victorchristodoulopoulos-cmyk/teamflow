import React from 'react';
import { Send, Settings, Trophy } from 'lucide-react';

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">El Proceso</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
            Tan simple como contar hasta tres
          </h2>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center mb-6 shadow-lg relative border-4 border-white">
                <Send size={32} />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center text-brand-dark font-bold border-2 border-white">1</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Envíanos la info</h3>
              <p className="text-slate-600 max-w-xs">
                Indícanos a qué torneo queréis ir, cuántos equipos sois y vuestras preferencias de alojamiento.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center mb-6 shadow-lg relative border-4 border-white">
                <Settings size={32} className="animate-spin-slow" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center text-brand-dark font-bold border-2 border-white">2</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Nosotros ejecutamos</h3>
              <p className="text-slate-600 max-w-xs">
                Gestionamos reservas, pagos, listados y documentación. Tú recibes reportes de estado semanales.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center mb-6 shadow-lg relative border-4 border-white">
                <Trophy size={32} />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center text-brand-dark font-bold border-2 border-white">3</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Todo listo a tiempo</h3>
              <p className="text-slate-600 max-w-xs">
                Recibes el pack completo de viaje y competición antes del deadline. Sin estrés, sin errores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;