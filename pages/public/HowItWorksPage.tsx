import React from 'react';
import { Send, Settings, Trophy, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: "01",
      icon: <Send size={32} />,
      title: "Envío de Información",
      desc: "Rellenas un formulario simple con el torneo deseado, número de equipos y preferencias de alojamiento. Sin compromisos."
    },
    {
      num: "02",
      icon: <Settings size={32} />,
      title: "Propuesta & Gestión",
      desc: "Te enviamos opciones de hoteles y transporte. Una vez aprobado, nosotros nos encargamos de reservar, pagar y coordinar todo."
    },
    {
      num: "03",
      icon: <Trophy size={32} />,
      title: "Competición",
      desc: "Tu equipo viaja con todo resuelto. Recibes un dossier completo y acceso a nuestra app para monitorizar el viaje en tiempo real."
    }
  ];

  return (
    <div className="bg-brand-deep min-h-screen">
       <div className="bg-brand-surface py-20 border-b border-white/5">
         <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-display font-black text-white italic uppercase mb-6">
               Cómo <span className="text-blue-500">Funciona</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
               Simplificamos la complejidad logística en tres pasos claros.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-6 py-24">
         <div className="relative">
            {/* Central Line (Desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2"></div>

            <div className="space-y-24">
               {steps.map((step, idx) => (
                  <div key={idx} className={`flex flex-col md:flex-row gap-12 items-center ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                     
                     {/* Content */}
                     <div className="flex-1 text-center md:text-left">
                        <div className={`text-6xl font-display font-black text-white/5 mb-4 ${idx % 2 !== 0 ? 'md:text-right' : ''}`}>{step.num}</div>
                        <h3 className={`text-3xl font-bold text-white mb-4 italic ${idx % 2 !== 0 ? 'md:text-right' : ''}`}>{step.title}</h3>
                        <p className={`text-slate-400 text-lg leading-relaxed ${idx % 2 !== 0 ? 'md:text-right' : ''}`}>
                           {step.desc}
                        </p>
                     </div>

                     {/* Icon Node */}
                     <div className="relative z-10 flex-shrink-0 w-24 h-24 bg-brand-surface border-4 border-brand-deep rounded-full flex items-center justify-center shadow-neon">
                        <div className="text-brand-neon">
                           {step.icon}
                        </div>
                     </div>

                     {/* Spacer for balance */}
                     <div className="flex-1 hidden md:block"></div>
                  </div>
               ))}
            </div>
         </div>

         <div className="mt-32 text-center">
            <h2 className="text-3xl font-bold text-white mb-8">¿Listo para empezar?</h2>
            <Link to="/contacto" className="inline-flex items-center gap-3 px-10 py-4 bg-brand-neon text-brand-deep font-bold text-lg uppercase tracking-wider rounded hover:bg-white transition-colors">
               Solicitar Propuesta <CheckCircle size={20} />
            </Link>
         </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;