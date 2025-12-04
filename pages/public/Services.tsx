import React from 'react';
import { ClipboardCheck, Hotel, Bus, FileText, CreditCard, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesPage: React.FC = () => {
  const services = [
    {
      icon: <ClipboardCheck size={40} />,
      title: "Inscripciones a Torneos",
      desc: "Tramitamos todas las fichas y registros con la organización del evento. Garantizamos que tu equipo cumple con todos los requisitos de la competición."
    },
    {
      icon: <Hotel size={40} />,
      title: "Gestión de Alojamiento",
      desc: "Buscamos, negociamos y reservamos el hotel ideal. Gestionamos el rooming list y regímenes de comidas adaptados a deportistas."
    },
    {
      icon: <Bus size={40} />,
      title: "Logística de Transporte",
      desc: "Coordinamos autobuses de larga distancia y traslados internos (hotel-campo-hotel) con puntualidad milimétrica."
    },
    {
      icon: <FileText size={40} />,
      title: "Control Documental",
      desc: "Plataforma digital para subida y validación de DNI, pasaportes y autorizaciones parentales. Adiós a los papeles perdidos."
    },
    {
      icon: <CreditCard size={40} />,
      title: "Pagos Centralizados",
      desc: "Centralizamos todos los pagos del viaje. Una sola factura para el club, gestión transparente y sin descuadres de caja."
    },
    {
      icon: <ShieldCheck size={40} />,
      title: "Seguros y Asistencia",
      desc: "Gestionamos seguros de viaje y accidentes deportivos para que la expedición viaje con total tranquilidad."
    }
  ];

  return (
    <div className="bg-brand-deep min-h-screen">
      <div className="bg-brand-surface py-20 border-b border-white/5 relative overflow-hidden">
         <div className="absolute inset-0 bg-carbon opacity-20"></div>
         <div className="container mx-auto px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-display font-black text-white italic uppercase mb-6">
               Nuestros <span className="text-brand-neon">Servicios</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
               Externaliza la logística operativa. Tú te encargas de la táctica, nosotros de que el equipo llegue, descanse y compita.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-6 py-20">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, idx) => (
               <div key={idx} className="bg-brand-surface/50 border border-white/5 p-8 rounded-2xl hover:bg-brand-surface hover:border-brand-neon/30 transition-all group hover:-translate-y-2 duration-300">
                  <div className="w-16 h-16 bg-brand-deep rounded-xl flex items-center justify-center text-brand-neon mb-6 border border-white/5 group-hover:scale-110 transition-transform shadow-neon">
                     {s.icon}
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-4 italic">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed">
                     {s.desc}
                  </p>
               </div>
            ))}
         </div>

         <div className="mt-20 bg-gradient-to-r from-blue-900 to-brand-deep border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/10 rounded-full blur-[80px]"></div>
            <h2 className="text-3xl font-display font-bold text-white mb-6 relative z-10">¿Tienes necesidades específicas?</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto relative z-10">
               Adaptamos nuestra gestión a clubes de todos los tamaños, desde academias locales hasta canteras de élite.
            </p>
            <Link to="/contacto" className="inline-block px-8 py-4 bg-brand-neon text-brand-deep font-bold uppercase tracking-wider rounded skew-x-[-12deg] hover:bg-white transition-colors relative z-10">
               <span className="skew-x-[12deg]">Contactar ahora</span>
            </Link>
         </div>
      </div>
    </div>
  );
};

export default ServicesPage;