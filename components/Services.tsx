// src/components/Services.tsx
import React from "react";
import {
  ClipboardCheck,
  Hotel,
  Bus,
  FileText,
  CreditCard,
  MessageCircle,
} from "lucide-react";

const services = [
  {
    icon: ClipboardCheck,
    title: "Inscripción oficial",
    description:
      "Gestionamos registros, fichas y validaciones directamente con la organización del torneo.",
  },
  {
    icon: Hotel,
    title: "Hoteles y alojamiento",
    description:
      "Selección, negociación y reserva de hoteles optimizados para equipos deportivos.",
  },
  {
    icon: Bus,
    title: "Transporte y logística",
    description:
      "Autobuses, transfers y coordinación completa de movimientos durante el torneo.",
  },
  {
    icon: FileText,
    title: "Control documental",
    description:
      "Recopilación y validación de DNI, pasaportes y autorizaciones de menores.",
  },
  {
    icon: CreditCard,
    title: "Pagos centralizados",
    description:
      "Unificamos todos los pagos. Un solo interlocutor. Cero errores administrativos.",
  },
  {
    icon: MessageCircle,
    title: "Comunicación continua",
    description:
      "Somos el punto único de contacto entre tu club y la organización del evento.",
  },
];

const Services: React.FC = () => {
  return (
    <section
      id="servicios"
      className="relative py-32 bg-brand-deep text-white overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-carbon opacity-20 mix-blend-overlay" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <span className="text-brand-neon text-xs font-bold uppercase tracking-widest">
            Qué hacemos
          </span>
          <h2 className="text-4xl md:text-5xl font-black italic mt-3 mb-6">
            Todo lo que un torneo necesita.
            <br />
            <span className="text-brand-neon">Sin fricción.</span>
          </h2>
          <p className="text-slate-300 text-lg">
            Cubrimos el ciclo completo de gestión logística y administrativa para
            equipos y clubes. Tú compites. Nosotros nos ocupamos del resto.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="group bg-brand-surface/60 backdrop-blur border border-white/10 rounded-2xl p-8 hover:border-brand-neon/40 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-neon/20 text-brand-neon flex items-center justify-center mb-6 group-hover:bg-brand-neon group-hover:text-brand-deep transition">
                  <Icon size={24} />
                </div>

                <h3 className="text-xl font-bold mb-3">
                  {service.title}
                </h3>

                <p className="text-slate-400 leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
