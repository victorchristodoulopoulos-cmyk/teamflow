import React from 'react';
import { Zap, ShieldCheck, BarChart3, Gauge } from 'lucide-react';

const TechShowcase: React.FC = () => {
  return (
    <section className="py-32 bg-black text-white relative overflow-hidden border-y border-white/5">
      {/* Luces de fondo premium pero sutiles */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-neon/10 rounded-full blur-[150px] pointer-events-none translate-x-1/3 -translate-y-1/3 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -translate-x-1/3 translate-y-1/3 opacity-50"></div>

      <div className="container mx-auto px-6 relative z-10">
        
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Lado Izquierdo: Beneficios claros para el director */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-neon text-[10px] font-black uppercase tracking-[0.2em]">
              <Gauge size={14} /> Potencia bajo control
            </div>
            
            <h2 className="text-4xl md:text-5xl font-display font-black italic leading-tight">
              El cerebro digital <br/>
              <span className="text-slate-500">que tu club necesita.</span>
            </h2>
            
            <p className="text-lg text-slate-400 leading-relaxed">
              Olvídate de cruzar excels y perseguir pagos. Nuestra tecnología trabaja 24/7 en segundo plano para que tú tengas una visión perfecta de lo que ocurre en tu club. Es como tener un asistente personal para la logística.
            </p>

            <div className="space-y-8 pt-6">
              {[
                {
                  icon: <Zap className="text-brand-neon" size={26} />,
                  title: "Todo actualizado al segundo",
                  desc: "Si un padre paga una cuota a las 23:00, tu panel se actualiza instantáneamente. Siempre tomas decisiones con datos reales."
                },
                {
                  icon: <ShieldCheck className="text-blue-500" size={26} />,
                  title: "Tus datos, blindados",
                  desc: "Usamos la misma seguridad que las apps bancarias. La información de tus menores y los pagos están en una caja fuerte digital."
                },
                {
                  icon: <BarChart3 className="text-emerald-500" size={26} />,
                  title: "Adiós al caos administrativo",
                  desc: "El sistema valida automáticamente que no falte ningún DNI ni autorización antes de que sea demasiado tarde."
                }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-5 items-start group">
                  <div className="w-14 h-14 rounded-2xl bg-[#162032] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-brand-neon/30 group-hover:bg-brand-neon/5 transition-all duration-300 shadow-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xl mb-2 tracking-tight">{feature.title}</h4>
                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lado Derecho: El Dashboard "Wow" (Sin código, solo resultados) */}
          <div className="relative">
            {/* Glow effect detrás del dashboard */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-neon/30 via-transparent to-blue-600/30 blur-3xl rounded-[50px] transform rotate-3 scale-105 opacity-40 animate-pulse-slow"></div>
            
            {/* La tarjeta del Dashboard */}
            <div className="relative bg-[#0a0f18]/90 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-700 group">
              
              {/* Cabecera del Panel */}
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-neon flex items-center justify-center shadow-[0_0_20px_rgba(var(--brand-neon),0.4)]">
                    <Gauge className="text-black" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-neon font-black uppercase tracking-widest mb-1">Centro de Control</p>
                    <p className="text-white font-bold text-lg">Resumen de Temporada</p>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  Sistema Operativo
                </div>
              </div>

              {/* Métricas Principales (Visuales y claras) */}
              <div className="space-y-8">
                
                {/* Métrica Grande: Dinero */}
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Recaudación Total (Tiempo Real)</p>
                  <p className="text-6xl font-black text-white italic tracking-tighter">
                    45.250<span className="text-brand-neon">€</span>
                  </p>
                </div>

                {/* Barras de Progreso Visuales */}
                <div className="space-y-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                  {[
                    { label: "Cuotas Pagadas", value: "92%", color: "bg-brand-neon", status: "Casi completo" },
                    { label: "Documentación Validada", value: "85%", color: "bg-blue-500", status: "En proceso" },
                    { label: "Logística (Bus/Hotel)", value: "100%", color: "bg-emerald-500", status: "Cerrado" },
                  ].map((bar, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-300">{bar.label}</span>
                        <span className="text-xs font-black text-white uppercase">{bar.status} ({bar.value})</span>
                      </div>
                      <div className="h-3 w-full bg-[#0a0f18] rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full ${bar.color} transition-all duration-1000 ease-out group-hover:scale-x-105 origin-left shadow-[0_0_10px_rgba(var(--brand-neon),0.3)]`} 
                          style={{ width: bar.value }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
              
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TechShowcase;