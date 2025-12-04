import React from 'react';
import { ClipboardCheck, Hotel, Bus, FileText, CreditCard, MessageCircle } from 'lucide-react';

const services = [
  {
    icon: <ClipboardCheck size={32} />,
    title: "Inscripciones a Torneos",
    description: "Tramitamos todas las fichas y registros con la organización del evento."
  },
  {
    icon: <Hotel size={32} />,
    title: "Gestión de Hoteles",
    description: "Buscamos, negociamos y reservamos el alojamiento ideal para tu equipo."
  },
  {
    icon: <Bus size={32} />,
    title: "Transporte y Logística",
    description: "Coordinamos autobuses y traslados internos con puntualidad garantizada."
  },
  {
    icon: <FileText size={32} />,
    title: "Control Documental",
    description: "Recopilación y validación de DNI, pasaportes y autorizaciones de menores."
  },
  {
    icon: <CreditCard size={32} />,
    title: "Pagos Unificados",
    description: "Centralizamos todos los pagos. Una sola factura para el club."
  },
  {
    icon: <MessageCircle size={32} />,
    title: "Comunicación Directa",
    description: "Somos el nexo entre tu club y la organización del torneo."
  }
];

const Services: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-slate-50 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            Todo lo que necesitas, <span className="text-blue-600">resuelto.</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Cubrimos el ciclo completo de logística deportiva para que tu staff técnico solo se preocupe del balón.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 group"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;