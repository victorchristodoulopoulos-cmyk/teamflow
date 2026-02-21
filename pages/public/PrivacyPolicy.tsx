import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05080f] py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="bg-[#162032]/80 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shrink-0">
              <Lock size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-black text-white italic uppercase tracking-tighter">Política de Privacidad</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Cumplimiento RGPD y LOPDGDD</p>
            </div>
          </div>

          <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
            <section>
              <h2 className="text-white font-black uppercase tracking-wider text-lg mb-3">1. Información al Usuario</h2>
              <p>[NOMBRE DE TU EMPRESA], como Responsable del Tratamiento, le informa que, según lo dispuesto en el Reglamento (UE) 2016/679 (RGPD) y en la L.O. 3/2018 (LOPDGDD), trataremos sus datos tal y como reflejamos en la presente Política de Privacidad.</p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-wider text-lg mb-3">2. Finalidad del Tratamiento</h2>
              <p>En TeamFlow tratamos la información que nos facilitan las personas interesadas con el fin de:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Gestionar la inscripción de los jugadores (incluidos menores de edad) en los clubes, torneos y stages.</li>
                <li>Gestionar el cobro de las cuotas a través de la pasarela de pagos segura (Stripe).</li>
                <li>Enviar comunicaciones operativas y logísticas referentes a los eventos deportivos.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-wider text-lg mb-3">3. Datos de Menores de Edad</h2>
              <p>Dado que la plataforma gestiona inscripciones de menores, la base legal para el tratamiento de estos datos es el consentimiento explícito otorgado por el padre, madre o tutor legal en el momento de crear la cuenta y vincular al jugador.</p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-wider text-lg mb-3">4. Proveedores de Servicios (Terceros)</h2>
              <p>Para prestar servicios estrictamente necesarios para el desarrollo de la actividad, compartimos datos con los siguientes prestadores bajo sus correspondientes condiciones de privacidad:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Infraestructura y Base de Datos:</strong> Supabase Inc. (Alojamiento seguro en la nube).</li>
                <li><strong>Procesamiento de Pagos:</strong> Stripe Inc. (No almacenamos datos de tarjetas de crédito en nuestros servidores).</li>
                <li><strong>Envío de Correos:</strong> Resend.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-wider text-lg mb-3">5. Derechos del Usuario</h2>
              <p>Cualquier persona tiene derecho a obtener confirmación sobre si estamos tratando datos personales que les conciernan, o no. Las personas interesadas tienen derecho a:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 mb-4">
                <li>Acceder a sus datos personales.</li>
                <li>Solicitar la rectificación de los datos inexactos.</li>
                <li>Solicitar su supresión cuando, entre otros motivos, los datos ya no sean necesarios.</li>
                <li>Solicitar la limitación u oposición de su tratamiento.</li>
              </ul>
              <p>Para ejercer estos derechos, puede enviar un correo electrónico a <strong>[TU EMAIL DE CONTACTO]</strong> adjuntando copia de su DNI.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}