import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { Trophy, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function ClubTournamentJoin() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [torneoName, setTorneoName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    conectarClubConTorneo();
  }, []);

  const conectarClubConTorneo = async () => {
    try {
      // 1. Verificar Usuario (Club)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Si no está logueado, lo mandamos al login con el redirect de vuelta aquí
        navigate(`/login/club?redirect=/club-dashboard/torneos/${torneoId}/join`);
        return;
      }

      // 2. Obtener datos del Torneo (Para mostrar el nombre bonito)
      const { data: torneo } = await supabase
        .from('torneos')
        .select('name')
        .eq('id', torneoId)
        .single();
      
      if (torneo) setTorneoName(torneo.name);

      // 3. Obtener datos del Perfil del Club (Para rellenar la ficha del torneo)
      // Buscamos en 'clubs' o 'profiles' dependiendo de tu estructura. 
      // Asumimos que el usuario logueado es el admin del club.
      const { data: perfilClub } = await supabase
        .from('profiles') // O tu tabla de 'clubs'
        .select('*')
        .eq('id', user.id)
        .single();

      // Preparar datos legibles (Si no tiene nombre en perfil, usamos el email o un placeholder)
      const nombreClub = perfilClub?.nombre_club || user.user_metadata?.nombre_club || "Club Sin Nombre";
      const telefono = perfilClub?.telefono || "";
      const email = user.email;

      // 4. 🔥 CRÍTICO: Verificar si YA existe la conexión para no duplicar
      const { data: existente } = await supabase
        .from('inscripciones_torneo')
        .select('id')
        .eq('torneo_id', torneoId)
        .eq('club_id', user.id) // La clave es el club_id
        .maybeSingle();

      if (existente) {
        // Ya estaba unido, no hacemos nada, solo mostramos éxito
        setStatus('success');
        setLoading(false);
        return;
      }

      // 5. 🔥 LA INSERCIÓN MÁGICA (Crea la fila en "Inscripciones")
      // Esto es lo que hace que aparezca en el panel del Torneo
      const { error: insertError } = await supabase
        .from('inscripciones_torneo')
        .insert([
          {
            torneo_id: torneoId,
            club_id: user.id,        // LINK: Conecta con el Club
            es_club_teamflow: true,  // LINK: Marca que es usuario de la plataforma
            nombre_club: nombreClub, // COPIA: Para que el torneo vea el nombre rápido
            email_responsable: email,
            telefono: telefono,
            estado: 'pendiente',     // Empieza pendiente hasta que confirme equipos
            categorias: [],          // Array vacío inicial
            categorias_confirmadas: []
          }
        ]);

      if (insertError) throw insertError;

      setStatus('success');

    } catch (err: any) {
      console.error("Error al unir club:", err);
      setErrorMsg(err.message || "No se pudo realizar la inscripción automática.");
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-brand-neon animate-spin mb-4" />
        <p className="text-slate-400 text-sm tracking-widest uppercase animate-pulse">Conectando con el Torneo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 bg-noise">
      <div className="max-w-md w-full bg-[#1e293b] border border-white/10 p-8 rounded-[32px] text-center shadow-2xl relative overflow-hidden">
        
        {status === 'success' ? (
          <div className="relative z-10 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 border border-green-500/30">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase mb-2">¡Conexión Éxita!</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Tu club ha sido inscrito oficialmente en <br/>
              <strong className="text-brand-neon">{torneoName}</strong>.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate(`/club-dashboard/torneos/${torneoId}`)}
                className="w-full py-4 bg-brand-neon text-brand-deep font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02]"
              >
                Gestionar mis Equipos <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => navigate('/club-dashboard')}
                className="w-full py-3 text-slate-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                Ir a mi Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 animate-in shake">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/30">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-white italic uppercase mb-2">Hubo un problema</h2>
            <p className="text-red-300 text-sm mb-6 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
              {errorMsg}
            </p>
            <button 
              onClick={() => navigate('/club-dashboard')} 
              className="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}