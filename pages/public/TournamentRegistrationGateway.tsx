import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { ShieldCheck, UserPlus, ArrowRight, Building2 } from "lucide-react";

// Importamos el formulario antiguo para mostrarlo si eligen "No tengo cuenta"
import PublicTournamentRegistration from "./PublicTournamentRegistration"; 

export default function TournamentRegistrationGateway() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState<'selection' | 'form'>('selection');
  const [torneoName, setTorneoName] = useState("");

  useEffect(() => {
    const fetchInfo = async () => {
      const { data } = await supabase.from('torneos').select('name').eq('id', torneoId).single();
      if (data) setTorneoName(data.name);
    };
    fetchInfo();
  }, [torneoId]);

  // Si eligen "No tengo cuenta", mostramos el formulario clásico
  if (view === 'form') {
    return <PublicTournamentRegistration />;
  }

  return (
    <div className="min-h-screen bg-brand-deep flex items-center justify-center p-6 bg-noise">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* IZQUIERDA: MENSAJE DE BIENVENIDA */}
        <div className="flex flex-col justify-center text-center md:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 w-fit mx-auto md:mx-0">
            <Building2 size={12} /> Inscripción Oficial
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
            {torneoName || "Torneo"}
          </h1>
          <p className="text-slate-400 text-lg">
            Bienvenido al proceso de inscripción. Elige cómo quieres gestionar tu participación.
          </p>
        </div>

        {/* DERECHA: LAS DOS PUERTAS */}
        <div className="space-y-4">
          
          {/* OPCIÓN A: YA SOY TEAMFLOW (Login + Link al Formulario VIP) */}
          <button 
            // 🔥 CAMBIO CLAVE: Redirigimos a /registro para que rellenen el formulario estando logueados
            onClick={() => navigate(`/login/club?redirect=/club-dashboard/torneos/${torneoId}/registro`)}
            className="w-full bg-[#162032] border border-white/10 hover:border-amber-500/50 p-8 rounded-[32px] group transition-all text-left relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-colors"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-brand-deep shadow-lg">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white italic uppercase">Ya tengo cuenta</h3>
                <p className="text-xs text-amber-500 font-bold uppercase tracking-widest">Recomendado</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Inicia sesión para vincular tu cuenta y rellenar el formulario de inscripción con tus datos ya cargados.
            </p>
            <div className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest group-hover:text-amber-500 transition-colors">
              Conectar Club <ArrowRight size={14} />
            </div>
          </button>

          {/* OPCIÓN B: SOY NUEVO (Formulario Externo) */}
          <button 
            onClick={() => setView('form')}
            className="w-full bg-[#162032] border border-white/10 hover:border-white/30 p-8 rounded-[32px] group transition-all text-left relative"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                <UserPlus size={24} />
              </div>
              <h3 className="text-xl font-black text-white italic uppercase">Soy un Club Nuevo</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Rellena el formulario de inscripción tradicional. Gestionaremos tu alta manualmente.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest group-hover:text-white transition-colors">
              Rellenar Formulario <ArrowRight size={14} />
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}