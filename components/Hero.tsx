// src/components/Hero.tsx
import React from "react";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-32 overflow-hidden bg-brand-deep text-white">
      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 right-0 w-[700px] h-[700px] bg-brand-neon/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-[-15%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-carbon opacity-30 mix-blend-overlay" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* TEXT */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-neon text-xs font-bold uppercase tracking-widest mb-6">
              <Zap size={14} />
              Gestión deportiva profesional
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black italic leading-[0.95] mb-6">
              Nosotros gestionamos.
              <br />
              <span className="text-brand-neon">Tú ganas.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 mb-10">
              Gestión profesional de torneos, hoteles, transporte y documentación.
              Tú te centras en competir. Nosotros en que todo funcione.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <button
                onClick={() =>
                  document
                    .getElementById("contacto")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 bg-brand-neon text-brand-deep font-extrabold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2"
              >
                Solicitar gestión
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("como-funciona")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 border border-white/20 font-bold rounded-xl hover:bg-white/5 transition"
              >
                Cómo funciona
              </button>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm font-bold text-slate-400 uppercase">
              {["Zero errores", "Logística pro", "Pagos centralizados"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-brand-neon" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* DASHBOARD MOCK */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-brand-neon to-blue-600 rounded-3xl blur-2xl opacity-20" />

              <div className="relative bg-brand-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 bg-brand-deep/80 border-b border-white/5 flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    teamflow_dashboard.exe
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-brand-neon font-bold">
                        Torneo actual
                      </div>
                      <div className="text-2xl font-bold italic">
                        Pirineos Cup 2024
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-green-500/20 text-green-400">
                      Ready
                    </span>
                  </div>

                  {[
                    ["Inscripción", "Confirmada", "bg-brand-neon"],
                    ["Hotel", "Reservado (24 habs)", "bg-blue-500"],
                    ["Transporte", "Asignado (54 plazas)", "bg-purple-500"],
                    ["Documentación", "100% validada", "bg-emerald-500"],
                  ].map(([label, status, color]) => (
                    <div
                      key={label}
                      className="flex justify-between items-center p-4 bg-brand-deep/60 rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-sm text-slate-300">{label}</span>
                      </div>
                      <span className="text-xs font-bold uppercase text-slate-400">
                        {status}
                      </span>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-500">
                    <span>Última sync: hace 2 min</span>
                    <div className="h-1.5 w-32 bg-brand-deep rounded-full overflow-hidden">
                      <div className="h-full w-full bg-brand-neon" />
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
