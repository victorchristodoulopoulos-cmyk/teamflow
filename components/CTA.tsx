import React from 'react';
import { ArrowRight } from 'lucide-react';

const CTA: React.FC = () => {
  return (
    <section id="contacto" className="py-24 bg-brand-dark relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
          ¿Listo para olvidarte de la gestión?
        </h2>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Déjanos los excels a nosotros. Envíanos los detalles de tu próximo torneo y te preparamos una propuesta sin compromiso.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-5 bg-brand-accent text-brand-dark font-bold text-lg rounded-xl hover:bg-brand-accentHover transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(163,230,53,0.4)]">
              Quiero que lo gestionéis por mí
            </button>
            <button className="px-8 py-5 bg-transparent border border-slate-600 text-white font-bold text-lg rounded-xl hover:bg-slate-800 transition-colors">
              Hablar con un experto
            </button>
        </div>
        
        <p className="mt-8 text-sm text-slate-500">
          Respuesta asegurada en menos de 24 horas.
        </p>
      </div>
    </section>
  );
};

export default CTA;