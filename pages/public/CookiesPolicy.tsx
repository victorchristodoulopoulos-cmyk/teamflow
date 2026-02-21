import React from 'react';
import { Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CookiesPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05080f] py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="bg-[#162032]/80 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400 shrink-0">
              <Info size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-black text-white italic uppercase tracking-tighter">Política de Cookies</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Uso de tecnologías de rastreo</p>
            </div>
          </div>

          <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
            <section>
              <h2 className="text-white font-black uppercase tracking-wider text-lg mb-3">1. ¿Qué es una cookie?</h2>
              <p>Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información que contengan y de la forma en que utilice su equipo, pueden utilizarse para reconocer al usuario.</p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-wider text-lg mb-3">2. Cookies utilizadas en TeamFlow</h2>
              <p>Actualmente, la plataforma TeamFlow utiliza <strong>única y exclusivamente cookies técnicas y de sesión (Estrictamente necesarias)</strong>.</p>
              <p className="mt-2">Estas cookies son esenciales para el correcto funcionamiento de la plataforma. Permiten, por ejemplo, mantener la sesión de usuario abierta de forma segura mediante Supabase Auth, recordar el estado del login y gestionar el carrito de pagos. <strong>Al ser cookies técnicas, no requieren el consentimiento explícito del usuario según la normativa vigente.</strong></p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-wider text-lg mb-3">3. Desactivación de cookies</h2>
              <p>Puede usted permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador instalado en su ordenador. Debe tener en cuenta que si desactiva las cookies técnicas, no podrá iniciar sesión ni utilizar la plataforma TeamFlow.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}