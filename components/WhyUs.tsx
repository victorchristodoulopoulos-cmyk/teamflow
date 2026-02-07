import React from 'react';
import { Clock, ShieldCheck, UserCheck, FileBarChart, AlertTriangle, Briefcase } from 'lucide-react';

const benefits = [
  {
    icon: <Clock className="text-brand-accent" size={24} />,
    title: "Ahorra 40+ horas",
    description: "Recupera el tiempo que pierdes en llamadas a hoteles y excels infinitos."
  },
  {
    icon: <ShieldCheck className="text-brand-accent" size={24} />,
    title: "Evita errores administrativos",
    description: "Una inscripción mal hecha puede descalificar a un equipo. Nosotros no fallamos."
  },
  {
    icon: <UserCheck className="text-brand-accent" size={24} />,
    title: "Un solo interlocutor",
    description: "En lugar de hablar con 10 proveedores, hablas solo con tu gestor TeamFlow."
  },
  {
    icon: <FileBarChart className="text-brand-accent" size={24} />,
    title: "Reporting Claro",
    description: "Sabrás en todo momento quién ha pagado, quién falta y qué está pendiente."
  },
  {
    icon: <AlertTriangle className="text-brand-accent" size={24} />,
    title: "Control de Deadlines",
    description: "Tenemos alertas automáticas para que nunca se pase una fecha límite."
  },
  {
    icon: <Briefcase className="text-brand-accent" size={24} />,
    title: "Gestión Profesional",
    description: "Negociamos como agencia, consiguiendo a menudo mejores condiciones."
  }
];

const WhyUs: React.FC = () => {
  return (
    <section id="beneficios" className="py-24 bg-brand-dark text-white relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/3">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              ¿Por qué elegir <br/> TeamFlow?
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Sabemos que organizar un viaje de torneo es un caos: padres preguntando, documentación que falta, hoteles llenos... 
              <br/><br/>
              TeamFlow nace para profesionalizar esa gestión y darte paz mental.
            </p>
            <a href="#pricing" className="text-brand-accent font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              Ver nuestros planes <span className="text-xl">→</span>
            </a>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors">
                <div className="mb-4 bg-slate-900/50 w-fit p-3 rounded-lg">
                    {benefit.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyUs;