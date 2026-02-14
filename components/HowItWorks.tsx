import React from 'react';
import { Database, Smartphone, LayoutDashboard } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Database size={32} />,
      title: "1. Activamos tu Ecosistema",
      description: "Damos de alta tu club, equipos y torneos en la plataforma. Recibes acceso inmediato a tu Panel de Control B2B para empezar a operar."
    },
    {
      icon: <Smartphone size={32} />,
      title: "2. Familias en Autopiloto",
      description: "Los padres reciben un acceso móvil. Pagan las cuotas (Tarjeta/Apple Pay/SEPA) y suben los DNIs directamente al sistema. Cero WhatsApps."
    },
    {
      icon: <LayoutDashboard size={32} />,
      title: "3. Control y Ejecución",
      description: "Tú solo ves cómo las barras del dashboard llegan al 100%. Con el dinero y los datos recaudados, nuestro equipo bloquea hoteles y transporte."
    }
  ];

  return (
    <section id="como-funciona" className="py-32 bg-[#05080f] text-white relative overflow-hidden">
      {/* Luces de fondo estilo Tech */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-brand-neon/5 blur-[150px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <span className="text-brand-neon font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">
            El Flujo TeamFlow
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-black italic text-white">
            Del caos del Excel <br/>
            <span className="text-slate-500">al control absoluto</span>
          </h2>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Línea conectora (Desktop) con efecto neón */}
          <div className="hidden lg:block absolute top-12 left-[10%] w-[80%] h-[2px] bg-gradient-to-r from-transparent via-brand-neon/50 to-transparent z-0"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                {/* Icono con Glow */}
                <div className="w-24 h-24 bg-[#162032] text-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl relative border border-white/10 group-hover:border-brand-neon/50 group-hover:bg-brand-neon/10 transition-all duration-500">
                  <div className="text-slate-400 group-hover:text-brand-neon transition-colors duration-500">
                    {step.icon}
                  </div>
                  {/* Número flotante tech */}
                  <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-brand-neon rounded-xl flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(var(--brand-neon),0.5)] transform group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-2xl font-black italic text-white mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-slate-400 leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;