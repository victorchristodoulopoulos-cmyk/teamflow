import React from 'react';
import { Clock, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const BenefitsPage: React.FC = () => {
  return (
    <div className="bg-brand-deep min-h-screen">
       <div className="bg-brand-surface py-20 border-b border-white/5 relative">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
         <div className="container mx-auto px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-display font-black text-white italic uppercase mb-6">
               Por qué <span className="text-brand-neon">TeamFlow</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
               No solo organizamos viajes. Optimizamos el rendimiento de tu club liberando recursos.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-6 py-20">
         
         {/* Key Stats */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-24">
            <div className="bg-brand-surface p-8 rounded-2xl border border-white/5 text-center">
               <div className="text-4xl font-display font-black text-white mb-2">+40h</div>
               <div className="text-sm text-slate-500 uppercase tracking-wide">Ahorradas por torneo</div>
            </div>
            <div className="bg-brand-surface p-8 rounded-2xl border border-white/5 text-center">
               <div className="text-4xl font-display font-black text-brand-neon mb-2">0%</div>
               <div className="text-sm text-slate-500 uppercase tracking-wide">Errores en Docs</div>
            </div>
            <div className="bg-brand-surface p-8 rounded-2xl border border-white/5 text-center">
               <div className="text-4xl font-display font-black text-blue-400 mb-2">24/7</div>
               <div className="text-sm text-slate-500 uppercase tracking-wide">Soporte Operativo</div>
            </div>
            <div className="bg-brand-surface p-8 rounded-2xl border border-white/5 text-center">
               <div className="text-4xl font-display font-black text-purple-400 mb-2">100%</div>
               <div className="text-sm text-slate-500 uppercase tracking-wide">Control Financiero</div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-brand-surface/30 p-8 rounded-3xl border border-white/5">
                <div className="bg-blue-500/20 w-14 h-14 rounded-xl flex items-center justify-center text-blue-400 mb-6">
                    <Clock size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Enfoque Deportivo</h3>
                <p className="text-slate-400 text-lg">
                    Tus entrenadores y directores deportivos están para mejorar el equipo, no para llamar a hoteles o perseguir DNIs de padres. Nosotros eliminamos esa carga.
                </p>
            </div>
             <div className="bg-brand-surface/30 p-8 rounded-3xl border border-white/5">
                <div className="bg-green-500/20 w-14 h-14 rounded-xl flex items-center justify-center text-green-400 mb-6">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Seguridad Jurídica</h3>
                <p className="text-slate-400 text-lg">
                    Cumplimos rigurosamente con la normativa de protección de datos y gestión de menores. Todos los documentos se validan y almacenan de forma segura.
                </p>
            </div>
             <div className="bg-brand-surface/30 p-8 rounded-3xl border border-white/5">
                <div className="bg-purple-500/20 w-14 h-14 rounded-xl flex items-center justify-center text-purple-400 mb-6">
                    <Users size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Centralización</h3>
                <p className="text-slate-400 text-lg">
                    Un solo proveedor para todo. Si el autobús llega tarde o el hotel tiene un problema, solo tienes que llamar a un número: el nuestro.
                </p>
            </div>
             <div className="bg-brand-surface/30 p-8 rounded-3xl border border-white/5">
                <div className="bg-orange-500/20 w-14 h-14 rounded-xl flex items-center justify-center text-orange-400 mb-6">
                    <TrendingUp size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Poder de Negociación</h3>
                <p className="text-slate-400 text-lg">
                    Al gestionar volumen para múltiples clubes, accedemos a tarifas de grupo en hoteles y transporte que un club individual raramente consigue.
                </p>
            </div>
         </div>
         
         <div className="mt-20 text-center">
             <Link to="/precios" className="text-brand-neon font-bold uppercase tracking-widest hover:text-white transition-colors border-b-2 border-brand-neon pb-1">Ver planes y precios</Link>
         </div>
      </div>
    </div>
  );
};

export default BenefitsPage;