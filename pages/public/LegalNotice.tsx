import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LegalNotice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05080f] py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-neon/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="bg-[#162032]/80 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-neon/10 flex items-center justify-center border border-brand-neon/20 text-brand-neon shrink-0">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-black text-white italic uppercase tracking-tighter">Aviso Legal</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Información Ley 34/2002 (LSSI-CE)</p>
            </div>
          </div>

          <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
            <section>
              <h2 className="text-white font-black uppercase tracking-wider text-lg mb-3">1. Datos Identificativos</h2>
              <p>En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, se reflejan los siguientes datos:</p>
              <ul className="mt-4 space-y-2 bg-[#0D1B2A] p-6 rounded-2xl border border-white/5">
                <li><strong className="text-white">Titular:</strong> [NOMBRE DE TU EMPRESA O TU NOMBRE COMPLETO SI ERES AUTÓNOMO]</li>
                <li><strong className="text-white">NIF/CIF:</strong> [TU NIF/CIF]</li>
                <li><strong className="text-white">Domicilio:</strong> [TU DIRECCIÓN COMPLETA]</li>
                <li><strong className="text-white">Correo electrónico:</strong> [TU EMAIL DE CONTACTO LEGAL]</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-wider text-lg mb-3">2. Usuarios</h2>
              <p>El acceso y/o uso de este portal (TeamFlow) atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente de las Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento.</p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-wider text-lg mb-3">3. Uso del Portal</h2>
              <p>TeamFlow proporciona el acceso a multitud de informaciones, servicios, programas o datos (en adelante, "los contenidos") en Internet pertenecientes al Titular o a sus licenciantes a los que el USUARIO pueda tener acceso. El USUARIO asume la responsabilidad del uso del portal.</p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-wider text-lg mb-3">4. Propiedad Intelectual e Industrial</h2>
              <p>El Titular por sí o como cesionario, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, etc.). Todos los derechos reservados.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}