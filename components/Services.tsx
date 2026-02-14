import React from "react";
import { Smartphone, LayoutDashboard, ShieldAlert, CreditCard, Users, FileCheck } from "lucide-react";

const platformFeatures = [
  {
    icon: LayoutDashboard,
    title: "Club Dashboard",
    description: "Panel de control B2B. Visualiza al instante qué equipos están listos, quién debe dinero y la logística de autobuses.",
  },
  {
    icon: Smartphone,
    title: "Portal Familias",
    description: "Cada padre tiene su propio acceso móvil para pagar cuotas con tarjeta, Apple Pay o transferencia SEPA en 1 clic.",
  },
  {
    icon: FileCheck,
    title: "Bóveda de Documentos",
    description: "Se acabó pedir DNIs por WhatsApp. Los padres suben los documentos a la plataforma y nosotros los validamos.",
  },
  {
    icon: CreditCard,
    title: "División de Pagos",
    description: "El dinero viaja de las familias directamente a las cuentas del torneo y del club. Conciliación automática.",
  },
  {
    icon: Users,
    title: "Portal de Entrenadores",
    description: "Asignación de habitaciones, control de asistencia al autobús y listas de jugadores siempre actualizadas en el móvil.",
  },
  {
    icon: ShieldAlert,
    title: "Soporte Operativo",
    description: "Detrás del software está nuestro equipo gestionando las reservas de hoteles y solucionando imprevistos en destino.",
  }
];

const Services: React.FC = () => {
  return (
    <section id="servicios" className="relative py-32 bg-[#0a0f18] text-white overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-20 text-center md:text-left">
          <span className="text-brand-neon text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
            El Ecosistema TeamFlow
          </span>
          <h2 className="text-4xl md:text-5xl font-black italic mt-3 mb-6">
            Software de élite.
            <br />
            <span className="text-slate-500">Operaciones impecables.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            No somos una simple agencia. TeamFlow te entrega una suite de aplicaciones interconectadas para que la información fluya desde el padre hasta la organización del torneo sin intermediarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-[#162032]/40 backdrop-blur border border-white/5 rounded-[32px] p-8 hover:bg-[#162032]/80 hover:border-white/10 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 text-brand-neon flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-neon group-hover:text-black transition-all">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase italic tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
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