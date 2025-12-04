import React from 'react';
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            Planes adaptados a tu club
          </h2>
          <p className="text-slate-600">
            Costes transparentes. Sin sorpresas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plan 1: Por Torneo */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Por Torneo</h3>
            <p className="text-slate-500 text-sm mb-6">Ideal para viajes puntuales.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">Variable</span>
              <span className="text-slate-500 text-sm"> / equipo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600 text-sm">
                <Check size={18} className="text-blue-500" /> Gestión de inscripción
              </li>
              <li className="flex items-center gap-3 text-slate-600 text-sm">
                <Check size={18} className="text-blue-500" /> Búsqueda de hotel
              </li>
              <li className="flex items-center gap-3 text-slate-600 text-sm">
                <Check size={18} className="text-blue-500" /> Gestión de pagos básica
              </li>
            </ul>
            <a href="#contact" className="w-full py-3 border-2 border-slate-900 text-slate-900 font-bold rounded-xl text-center hover:bg-slate-50 transition-colors">
              Consultar precio
            </a>
          </div>

          {/* Plan 2: All-in (Featured) */}
          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-accent text-brand-dark px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Más popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pack Temporada</h3>
            <p className="text-slate-400 text-sm mb-6">Externaliza toda la gestión anual.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">Personalizado</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="bg-brand-accent rounded-full p-0.5"><Check size={12} className="text-brand-dark" /></div>
                Torneos ilimitados
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="bg-brand-accent rounded-full p-0.5"><Check size={12} className="text-brand-dark" /></div>
                Gestión integral (Hoteles + Bus)
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="bg-brand-accent rounded-full p-0.5"><Check size={12} className="text-brand-dark" /></div>
                Recopilación de DNI/Docs
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="bg-brand-accent rounded-full p-0.5"><Check size={12} className="text-brand-dark" /></div>
                Gestor dedicado 24/7
              </li>
               <li className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="bg-brand-accent rounded-full p-0.5"><Check size={12} className="text-brand-dark" /></div>
                Informes para directiva
              </li>
            </ul>
            <a href="#contact" className="w-full py-3 bg-brand-accent text-brand-dark font-bold rounded-xl text-center hover:bg-brand-accentHover transition-colors shadow-lg shadow-lime-500/20">
              Agendar llamada
            </a>
          </div>

          {/* Plan 3: Por Equipo */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Por Equipo</h3>
            <p className="text-slate-500 text-sm mb-6">Para clubes con pocos viajes.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">Fijo</span>
              <span className="text-slate-500 text-sm"> / viaje</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600 text-sm">
                <Check size={18} className="text-blue-500" /> Gestión completa del viaje
              </li>
              <li className="flex items-center gap-3 text-slate-600 text-sm">
                <Check size={18} className="text-blue-500" /> Soporte durante el torneo
              </li>
              <li className="flex items-center gap-3 text-slate-600 text-sm">
                <Check size={18} className="text-blue-500" /> Gestión de documentación
              </li>
            </ul>
            <a href="#contact" className="w-full py-3 border-2 border-slate-900 text-slate-900 font-bold rounded-xl text-center hover:bg-slate-50 transition-colors">
              Consultar precio
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;