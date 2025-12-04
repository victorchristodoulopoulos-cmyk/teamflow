import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="bg-brand-deep min-h-screen">
      <div className="container mx-auto px-6 py-20">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div>
                <h1 className="text-5xl font-display font-black text-white italic uppercase mb-6">
                    Hablemos de <span className="text-brand-neon">Victoria</span>
                </h1>
                <p className="text-xl text-slate-400 mb-12">
                    Déjanos tus datos y un especialista en logística deportiva te contactará en menos de 24 horas para analizar las necesidades de tu club.
                </p>

                <div className="space-y-8">
                    <div className="flex items-start gap-6">
                        <div className="bg-brand-surface p-4 rounded-xl border border-white/10 text-brand-neon">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Email</h3>
                            <p className="text-slate-400">hola@teamflow.pro</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-6">
                        <div className="bg-brand-surface p-4 rounded-xl border border-white/10 text-blue-400">
                            <Phone size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Teléfono</h3>
                            <p className="text-slate-400">+34 912 345 678</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-6">
                        <div className="bg-brand-surface p-4 rounded-xl border border-white/10 text-purple-400">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Oficinas</h3>
                            <p className="text-slate-400">Calle del Deporte 10, Madrid</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-brand-surface border border-white/5 p-8 md:p-10 rounded-3xl shadow-2xl relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-neon/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h2 className="text-2xl font-bold text-white mb-6">Solicitar Propuesta</h2>
                <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-slate-400 text-sm font-bold mb-2">Nombre</label>
                            <input type="text" className="w-full bg-brand-deep border border-white/10 rounded-xl p-4 text-white focus:border-brand-neon outline-none" placeholder="Tu nombre" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm font-bold mb-2">Club / Entidad</label>
                            <input type="text" className="w-full bg-brand-deep border border-white/10 rounded-xl p-4 text-white focus:border-brand-neon outline-none" placeholder="Nombre del club" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm font-bold mb-2">Email</label>
                        <input type="email" className="w-full bg-brand-deep border border-white/10 rounded-xl p-4 text-white focus:border-brand-neon outline-none" placeholder="tu@email.com" />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm font-bold mb-2">Mensaje</label>
                        <textarea className="w-full bg-brand-deep border border-white/10 rounded-xl p-4 text-white focus:border-brand-neon outline-none h-32" placeholder="Cuéntanos qué necesitas..."></textarea>
                    </div>
                    <button className="w-full py-4 bg-brand-neon text-brand-deep font-black uppercase tracking-wider rounded-xl hover:bg-white transition-all shadow-neon flex items-center justify-center gap-2">
                        Enviar Solicitud <Send size={18} />
                    </button>
                </form>
            </div>

         </div>
      </div>
    </div>
  );
};

export default ContactPage;