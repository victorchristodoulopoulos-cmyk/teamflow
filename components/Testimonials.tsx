import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Antes tardaba semanas en organizar el viaje a la Donosti Cup. Con TeamFlow, solo tuve que aprobar el presupuesto y subir la lista de jugadores. Increíble.",
    author: "Carlos Méndez",
    role: "Director Deportivo, CD Rayo",
    image: "https://picsum.photos/id/1005/100/100"
  },
  {
    quote: "La tranquilidad de saber que los DNIs y las autorizaciones estaban controladas no tiene precio. Nos evitaron un susto grande con un pasaporte caducado.",
    author: "Laura García",
    role: "Coordinadora, Academia Elite",
    image: "https://picsum.photos/id/1027/100/100"
  },
  {
    quote: "Gestión de autobuses y hoteles impecable. Mis entrenadores pudieron centrarse 100% en los partidos. Repetiremos seguro.",
    author: "Javier Ruiz",
    role: "Entrenador Sub-16",
    image: "https://picsum.photos/id/1012/100/100"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            Directores deportivos felices
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div key={index} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col">
              <div className="flex gap-1 mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-slate-700 italic mb-6 flex-1">"{item.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.author} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{item.author}</div>
                  <div className="text-slate-500 text-xs">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;