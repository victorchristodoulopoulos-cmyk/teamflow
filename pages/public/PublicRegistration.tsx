import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { ShieldCheck, Loader2, ArrowRight, UserPlus, Lock, Mail, PartyPopper, Users, User, LogOut, CreditCard, Trophy, Plane, Calendar, MapPin, Shield } from "lucide-react";

// Función auxiliar para obtener logos
const getImageUrl = (path: string | null, bucket: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export default function PublicRegistration() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const clubId = searchParams.get("club");
  const torneoId = searchParams.get("torneo");
  const stageId = searchParams.get("stage"); 
  const isStage = !!stageId; 

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [clubData, setClubData] = useState<any>(null);
  const [eventData, setEventData] = useState<any>(null); 
  const [clubLogo, setClubLogo] = useState<string | null>(null);

  const [authUser, setAuthUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [existingPlayers, setExistingPlayers] = useState<any[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('NEW');

  // 🔥 Añadido 'categoria' al estado inicial
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    parentName: "",
    parentDni: "",
    playerName: "",
    playerSurname: "",
    playerDni: "",
    playerDob: "",
    actualTeam: "",
    position: "",
    categoria: "" 
  });

  useEffect(() => {
    checkSession();
    if (clubId && (torneoId || stageId)) {
      fetchContextData();
    } else {
      setErrorMsg("Enlace inválido. Faltan parámetros del club o del evento.");
      setLoadingInitial(false);
    }
  }, [clubId, torneoId, stageId]);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setAuthUser(session.user);
      fetchExistingPlayers(session.user.id);
    }
  };

  const fetchExistingPlayers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('player_guardians')
        .select('jugadores(*)')
        .eq('family_profile_id', userId);
        
      if (!error && data) {
        const players = data.map((d: any) => d.jugadores).filter(Boolean);
        setExistingPlayers(players);
      }
    } catch (err) {
      console.error("Error buscando jugadores:", err);
    }
  };

  const fetchContextData = async () => {
    try {
      const { data: club } = await supabase.from('clubs').select('*').eq('id', clubId).single();
      if (club) {
        setClubData(club);
        setClubLogo(getImageUrl(club.logo_path, 'club-logos'));
      }

      if (isStage) {
        const { data: stage } = await supabase.from('stages').select('*').eq('id', stageId).single();
        if (stage) setEventData(stage);
      } else {
        const { data: torneo } = await supabase.from('torneos').select('*').eq('id', torneoId).single();
        if (torneo) setEventData(torneo);
      }
    } catch (err) {
      setErrorMsg("Error cargando la información de la entidad.");
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      if (error) throw error;
      setAuthUser(data.user);
      await fetchExistingPlayers(data.user.id);
    } catch (err: any) {
      setErrorMsg("Credenciales incorrectas o cuenta no existe.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setExistingPlayers([]);
    setSelectedPlayerId('NEW');
    setFormData({...formData, email: '', password: ''});
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      let currentUserId = authUser?.id;

      if (!currentUserId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;
        currentUserId = authData.user?.id;
        if (!currentUserId) throw new Error("No se pudo crear el usuario.");

        const { error: profileError } = await supabase.from('profiles').upsert({ 
          id: currentUserId, 
          role: 'family',
          email: formData.email,
          full_name: formData.parentName.trim(), 
          dni: formData.parentDni.trim(), 
          system_role: 'user'
        });
        if (profileError) throw profileError;
      }

      let targetPlayerId = selectedPlayerId;

      if (targetPlayerId === 'NEW') {
        targetPlayerId = crypto.randomUUID();

        // 🔥 Ahora cogemos el nombre y apellidos directamente de los inputs
        const { error: playerError } = await supabase.from('jugadores').insert([{
          id: targetPlayerId,
          name: formData.playerName.trim(),
          surname: formData.playerSurname.trim(),
          dni: formData.playerDni,
          birth_date: formData.playerDob,
          actual_team: formData.actualTeam, 
          position: formData.position, 
          categoria: formData.categoria, 
          status: 'activo'
        }]);
        if (playerError) throw playerError;

        const { error: guardianError } = await supabase.from('player_guardians').insert([{
          player_id: targetPlayerId,
          family_profile_id: currentUserId
        }]);
        if (guardianError) throw guardianError;
      }

      if (isStage && stageId && targetPlayerId) {
        const { data: checkInscripcion } = await supabase
          .from('stage_inscripciones')
          .select('id')
          .eq('stage_id', stageId)
          .eq('player_id', targetPlayerId)
          .single();

        if (checkInscripcion) throw new Error("Este jugador ya está inscrito en este viaje.");

        const { error: stageError } = await supabase.from('stage_inscripciones').insert([{
          stage_id: stageId,
          player_id: targetPlayerId,
          club_id: clubId,
          estado: 'inscrito'
        }]);
        if (stageError) throw stageError;

      } else if (torneoId && targetPlayerId) {
        const { data: checkInscripcion } = await supabase
          .from('torneo_jugadores')
          .select('id')
          .eq('torneo_id', torneoId)
          .eq('player_id', targetPlayerId)
          .single();

        if (checkInscripcion) throw new Error("Este jugador ya está inscrito en este torneo.");

        const { error: torneoJugadorError } = await supabase.from('torneo_jugadores').insert([{
          torneo_id: torneoId,
          player_id: targetPlayerId,
          club_id: clubId,
          status: 'inscrito'
        }]);
        if (torneoJugadorError) throw torneoJugadorError;
      }

     // ================================================================
      // 🔥 MAGIA: AVISAR AL CLUB POR EMAIL DE LA NUEVA INSCRIPCIÓN
      // ================================================================
      try {
        // 1. Buscamos el email del administrador de este club
        const { data: adminData } = await supabase
          .from('profiles')
          .select('email')
          .eq('club_id', clubId)
          .eq('role', 'club')
          .single();

        if (adminData && adminData.email) {
          // 2. Disparamos el correo en segundo plano usando nuestra Edge Function
          supabase.functions.invoke('send-email', {
            body: {
              to: adminData.email,
              subject: `🎉 Nueva Inscripción: ${formData.playerName} ${formData.playerSurname}`,
              html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-w: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                  <div style="background-color: #0D1B2A; padding: 20px; text-align: center; border-bottom: 4px solid #A3E635;">
                    <h2 style="color: #ffffff; margin: 0; font-style: italic;">TEAMFLOW ALERTS</h2>
                  </div>
                  <div style="padding: 30px; background-color: #f9fafb;">
                    <h3 style="margin-top: 0; color: #0D1B2A;">¡Tienes un nuevo jugador inscrito!</h3>
                    <p style="font-size: 16px;"><strong>Jugador:</strong> ${formData.playerName} ${formData.playerSurname}</p>
                    <p style="font-size: 16px;"><strong>Evento:</strong> ${eventName}</p>
                    <p style="font-size: 16px;"><strong>Categoría:</strong> ${formData.categoria || 'Sin especificar'}</p>
                    <p style="font-size: 16px;"><strong>Contacto Tutor:</strong> ${formData.email}</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
                    <p style="font-size: 14px; color: #666;">Entra en tu panel de control de TeamFlow para asignarlo a su equipo correspondiente.</p>
                  </div>
                </div>
              `
            }
          }); // No le ponemos 'await' para que no retrase la pantalla de éxito al padre
        }
      } catch (mailError) {
        console.error("Error silencioso al enviar el mail al club:", mailError);
      }
      // ================================================================

      setSuccess(true);
      setTimeout(() => navigate("/family-dashboard"), 1500);

    } catch (err: any) {
      console.error("🚨 Error:", err);
      setErrorMsg(err.message || "Error en el registro.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05080f] text-center p-6">
      <div className="w-24 h-24 bg-brand-neon rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_50px_rgba(163,230,53,0.5)]">
        <PartyPopper size={48} className="text-brand-deep" />
      </div>
      <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">¡INSCRIPCIÓN COMPLETADA!</h2>
      <p className="text-slate-400 text-lg">Iniciando tu sesión segura en TeamFlow...</p>
    </div>
  );

  if (loadingInitial) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05080f]">
      <Loader2 className="animate-spin text-brand-neon" size={40} />
    </div>
  );

  const eventName = eventData?.name || eventData?.nombre;
  const eventDate = eventData?.fecha || eventData?.fecha_inicio;
  const eventLocation = eventData?.ciudad || eventData?.lugar;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#05080f] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-neon/5 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-xl bg-[#162032]/90 backdrop-blur-xl border border-white/10 rounded-[40px] p-6 md:p-8 shadow-2xl relative z-10">
        
        <div className="text-center mb-8 pb-6 border-b border-white/5">
          {clubLogo ? (
            <div className="w-20 h-20 mx-auto bg-white rounded-2xl p-2 shadow-xl mb-4 border border-white/20">
              <img src={clubLogo} alt={clubData?.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
              <Shield size={32} className="text-slate-500" />
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tight">{clubData?.name}</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            {isStage ? <Plane size={14} className="text-amber-500" /> : <Trophy size={14} className="text-brand-neon" />}
            <p className={`font-bold text-xs uppercase tracking-widest ${isStage ? 'text-amber-500' : 'text-brand-neon'}`}>
              {isStage ? 'STAGE / VIAJE' : 'TORNEO OFICIAL'}
            </p>
          </div>
        </div>

        {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-center font-bold animate-in shake">{errorMsg}</div>}

        {!authUser ? (
          <>
            <div className="flex bg-[#0a0f18] p-1 rounded-2xl mb-8 border border-white/5">
              <button 
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'signup' ? 'bg-brand-neon text-black' : 'text-slate-400 hover:text-white'}`}
              >
                Soy Nuevo (Registrar)
              </button>
              <button 
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'login' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Ya tengo cuenta
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input required type="email" placeholder="Tu Email de TeamFlow" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input required type="password" placeholder="Tu Contraseña" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-blue-400 transition-all flex items-center justify-center gap-3">
                  {submitting ? <Loader2 className="animate-spin" size={24} /> : "Iniciar Sesión y Continuar"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegistration} className="space-y-6">
                
                {/* DATOS DEL TUTOR */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-brand-neon tracking-widest flex items-center gap-2"><UserPlus size={14}/> Datos del Tutor Legal</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input required type="text" placeholder="Nombre y Apellidos" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white outline-none focus:border-brand-neon text-sm" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
                    </div>
                    <div className="relative group">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input required type="text" placeholder="DNI / Pasaporte" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white outline-none focus:border-brand-neon text-sm" value={formData.parentDni} onChange={e => setFormData({...formData, parentDni: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input required type="email" placeholder="Email (Usuario)" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white outline-none focus:border-brand-neon text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input required type="password" placeholder="Contraseña segura" minLength={6} className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white outline-none focus:border-brand-neon text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* DATOS DEL JUGADOR */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2"><ShieldCheck size={14}/> Datos del Jugador</h3>
                  {/* 🔥 Cambio Clínico: Dividido en 2 columnas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required type="text" placeholder="Nombre del niño/a" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 font-bold" value={formData.playerName} onChange={e => setFormData({...formData, playerName: e.target.value})} />
                    <input required type="text" placeholder="Apellidos" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 font-bold" value={formData.playerSurname} onChange={e => setFormData({...formData, playerSurname: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" placeholder="DNI del niño/a" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 text-sm" value={formData.playerDni} onChange={e => setFormData({...formData, playerDni: e.target.value})} />
                    <input required type="date" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 color-scheme-dark text-sm" value={formData.playerDob} onChange={e => setFormData({...formData, playerDob: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" placeholder="Equipo Actual (Ej: FCB Benjamín)" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 text-sm" value={formData.actualTeam} onChange={e => setFormData({...formData, actualTeam: e.target.value})} />
                    <select required className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-slate-300 outline-none focus:border-blue-400 appearance-none text-sm" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
                      <option value="" disabled>Posición Principal</option>
                      <option value="Portero">Portero</option>
                      <option value="Defensa">Defensa</option>
                      <option value="Centrocampista">Centrocampista</option>
                      <option value="Delantero">Delantero</option>
                    </select>
                  </div>

                  {/* 🔥 NUEVO: DESPLEGABLE DE CATEGORÍA */}
                  <div className="relative mt-2">
                    <select required className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-neon appearance-none font-bold text-sm" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                      <option value="" disabled>Selecciona su Categoría Actual</option>
                      <option value="S7">Sub-7 (S7)</option>
                      <option value="S8">Sub-8 (S8)</option>
                      <option value="S9">Sub-9 (S9)</option>
                      <option value="S10">Sub-10 (S10)</option>
                      <option value="S11">Sub-11 (S11)</option>
                      <option value="S12">Sub-12 (S12)</option>
                      <option value="S13">Sub-13 (S13)</option>
                      <option value="S14">Sub-14 (S14)</option>
                      <option value="S15">Sub-15 (S15)</option>
                      <option value="S16">Sub-16 (S16)</option>
                      <option value="JUVENIL">Juvenil</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 p-5 rounded-2xl bg-[#0a0f18] border border-brand-neon/30 relative overflow-hidden shadow-[0_0_20px_rgba(163,230,53,0.05)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-neon/10 rounded-full blur-[40px] pointer-events-none"></div>
                  <p className="text-[9px] font-black uppercase text-brand-neon tracking-widest mb-3 relative z-10">Resumen de Inscripción</p>
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      {isStage ? <Plane size={20} className="text-white"/> : <Trophy size={20} className="text-white"/>}
                    </div>
                    <div>
                      <h4 className="font-bold text-white leading-tight mb-2">{eventName}</h4>
                      <div className="flex flex-col gap-1 text-xs text-slate-400 font-medium">
                        {eventLocation && <span className="flex items-center gap-2"><MapPin size={12}/> {eventLocation}</span>}
                        {eventDate && <span className="flex items-center gap-2"><Calendar size={12}/> {isStage ? eventDate : new Date(eventDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full bg-brand-neon hover:bg-white text-brand-deep font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                  {submitting ? <Loader2 className="animate-spin" size={24} /> : <>CONFIRMAR INSCRIPCIÓN <ArrowRight size={20} /></>}
                </button>
              </form>
            )}
          </>
        ) : (
          <form onSubmit={handleRegistration} className="space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-neon/20 rounded-full flex items-center justify-center text-brand-neon">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cuenta Activa</p>
                  <p className="text-white font-bold">{authUser.email}</p>
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="text-red-400 p-2 hover:bg-red-400/10 rounded-xl transition-colors">
                <LogOut size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-brand-neon tracking-widest flex items-center gap-2"><Users size={14}/> ¿A quién vamos a inscribir?</h3>
              
              <div className="grid gap-3">
                {existingPlayers.map(player => (
                  <div 
                    key={player.id} 
                    onClick={() => setSelectedPlayerId(player.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${selectedPlayerId === player.id ? 'bg-brand-neon/10 border-brand-neon text-white' : 'bg-[#0a0f18] border-white/10 text-slate-400 hover:border-white/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlayerId === player.id ? 'border-brand-neon' : 'border-slate-500'}`}>
                        {selectedPlayerId === player.id && <div className="w-2.5 h-2.5 bg-brand-neon rounded-full" />}
                      </div>
                      <span className="font-bold">{player.name} {player.surname}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase opacity-50">{player.categoria || player.position || 'Jugador'}</span>
                  </div>
                ))}

                <div 
                  onClick={() => setSelectedPlayerId('NEW')}
                  className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${selectedPlayerId === 'NEW' ? 'bg-blue-500/10 border-blue-500 text-white' : 'bg-[#0a0f18] border-white/10 text-slate-400 hover:border-white/30'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlayerId === 'NEW' ? 'border-blue-500' : 'border-slate-500'}`}>
                    {selectedPlayerId === 'NEW' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </div>
                  <span className="font-bold">Añadir otro jugador (Hermano/a)</span>
                </div>
              </div>
            </div>

            {selectedPlayerId === 'NEW' && (
              <div className="space-y-4 p-6 bg-black/20 rounded-3xl border border-white/5 animate-in slide-in-from-top-4">
                {/* 🔥 Cambio Clínico: Dividido en 2 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required type="text" placeholder="Nombre del jugador/a" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 font-bold" value={formData.playerName} onChange={e => setFormData({...formData, playerName: e.target.value})} />
                  <input required type="text" placeholder="Apellidos" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 font-bold" value={formData.playerSurname} onChange={e => setFormData({...formData, playerSurname: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="DNI" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400" value={formData.playerDni} onChange={e => setFormData({...formData, playerDni: e.target.value})} />
                  <input required type="date" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 color-scheme-dark" value={formData.playerDob} onChange={e => setFormData({...formData, playerDob: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="Equipo actual" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400" value={formData.actualTeam} onChange={e => setFormData({...formData, actualTeam: e.target.value})} />
                  <select required className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-slate-300 outline-none focus:border-blue-400 appearance-none" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
                    <option value="" disabled>Posición Principal</option>
                    <option value="Portero">Portero</option>
                    <option value="Defensa">Defensa</option>
                    <option value="Centrocampista">Centrocampista</option>
                    <option value="Delantero">Delantero</option>
                  </select>
                </div>
                
                {/* 🔥 NUEVO: DESPLEGABLE DE CATEGORÍA (Modo logueado añadiendo hijo) */}
                <div className="relative mt-2">
                  <select required className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 appearance-none font-bold text-sm" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                    <option value="" disabled>Selecciona su Categoría Actual</option>
                    <option value="S7">Sub-7 (S7)</option>
                    <option value="S8">Sub-8 (S8)</option>
                    <option value="S9">Sub-9 (S9)</option>
                    <option value="S10">Sub-10 (S10)</option>
                    <option value="S11">Sub-11 (S11)</option>
                    <option value="S12">Sub-12 (S12)</option>
                    <option value="S13">Sub-13 (S13)</option>
                    <option value="S14">Sub-14 (S14)</option>
                    <option value="S15">Sub-15 (S15)</option>
                    <option value="S16">Sub-16 (S16)</option>
                    <option value="JUVENIL">Juvenil</option>
                  </select>
                </div>
              </div>
            )}

            <div className="mt-8 p-5 rounded-2xl bg-[#0a0f18] border border-brand-neon/30 relative overflow-hidden shadow-[0_0_20px_rgba(163,230,53,0.05)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-neon/10 rounded-full blur-[40px] pointer-events-none"></div>
              <p className="text-[9px] font-black uppercase text-brand-neon tracking-widest mb-3 relative z-10">Resumen de Inscripción</p>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {isStage ? <Plane size={20} className="text-white"/> : <Trophy size={20} className="text-white"/>}
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight mb-2">{eventName}</h4>
                  <div className="flex flex-col gap-1 text-xs text-slate-400 font-medium">
                    {eventLocation && <span className="flex items-center gap-2"><MapPin size={12}/> {eventLocation}</span>}
                    {eventDate && <span className="flex items-center gap-2"><Calendar size={12}/> {isStage ? eventDate : new Date(eventDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-brand-neon hover:bg-white text-brand-deep font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(163,230,53,0.3)]">
              {submitting ? <Loader2 className="animate-spin" size={24} /> : <>CONFIRMAR INSCRIPCIÓN <ArrowRight size={20} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}