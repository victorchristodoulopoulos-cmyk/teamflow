import React from 'react';
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-28 pb-16 lg:pt-48 lg:pb-32 overflow-hidden bg-brand-deep text-white">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 right-0 w-[800px] h-[800px] bg-brand-neon/10 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] opacity-40"></div>
        {/* Carbon Pattern Overlay */}
        <div className="absolute inset-0 bg-carbon opacity-30 mix-blend-overlay"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-neon text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8 animate-slide-up">
              <Zap size={12} className="fill-current" />
              Gestión Deportiva de Alto Rendimiento
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[0.9] mb-6 md:mb-8 italic uppercase animate-slide-up [animation-delay:100ms]">
              Nosotros <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-platinum to-slate-400">gestionamos.</span><br />
              <span className="text-brand-neon text-glow">Tú ganas.</span>
            </h1>
            
            <p className="text-base md:text-xl text-brand-dim mb-8 md:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium animate-slide-up [animation-delay:200ms]">
              Gestión profesional de inscripciones, hoteles, transporte y documentación. Tú haces deporte, nosotros hacemos que todo funcione.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center lg:justify-start animate-slide-up [animation-delay:300ms]">
              <Link
                to="/contacto"
                className="px-8 py-4 md:py-5 bg-brand-neon text-brand-deep font-display font-extrabold text-lg rounded skew-x-[-12deg] hover:bg-white transition-all transform hover:-translate-y-1 shadow-neon flex items-center justify-center gap-2 group"
              >
                <span className="skew-x-[12deg] flex items-center gap-2">
                   SOLICITAR GESTIÓN <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                to="/como-funciona"
                className="px-8 py-4 md:py-5 bg-transparent border-2 border-white/20 text-white font-display font-bold text-lg rounded skew-x-[-12deg] hover:bg-white/5 hover:border-brand-neon/50 transition-colors flex items-center justify-center"
              >
                <span className="skew-x-[12deg]">CÓMO FUNCIONA</span>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wide animate-slide-up [animation-delay:400ms]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-neon" />
                <span>Zero Errores</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-neon" />
                <span>Logística Pro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-neon" />
                <span>Pagos Seguros</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none animate-float hidden md:block">
            <div className="relative transform skew-y-[-2deg]">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-brand-neon to-blue-600 rounded-2xl blur-2xl opacity-20"></div>
              
              <div className="relative bg-brand-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 bg-brand-deep/80 border-b border-white/5 flex justify-between items-center backdrop-blur">
                   <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                   </div>
                   <div className="text-xs font-mono text-slate-500">teamflow_dashboard.exe</div>
                </div>

                {/* Dashboard Content Mock */}
                <div className="p-8 bg-brand-surface/90 backdrop-blur-sm">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <div className="text-brand-neon text-xs font-bold uppercase tracking-widest mb-1">Torneo Actual</div>
                            <div className="text-white font-display font-bold text-2xl italic">DONOSTI CUP 2024</div>
                        </div>
                        <span className="bg-green-500/20 text-green-400 border border-green-500/20 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider animate-pulse">
                            Ready to Fly
                        </span>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Inscripción Oficial', status: 'Confirmado', color: 'text-brand-neon', bg: 'bg-brand-neon' },
                            { label: 'Hotel Hilton Garden', status: 'Reservado (24 habs)', color: 'text-blue-400', bg: 'bg-blue-500' },
                            { label: 'Autobús Privado', status: 'Asignado (54 plazas)', color: 'text-purple-400', bg: 'bg-purple-500' },
                            { label: 'Documentación', status: '100% Validada', color: 'text-emerald-400', bg: 'bg-emerald-500' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-brand-deep/50 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${item.bg} shadow-[0_0_8px_currentColor]`}></div>
                                    <span className="text-slate-300 font-medium text-sm">{item.label}</span>
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wide ${item.color}`}>{item.status}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                        <div className="text-slate-500 text-xs font-mono">Última sync: Hace 2 min</div>
                        <div className="h-1.5 w-32 bg-brand-deep rounded-full overflow-hidden">
                            <div className="h-full w-full bg-brand-neon shadow-[0_0_10px_#C9FF2F]"></div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;