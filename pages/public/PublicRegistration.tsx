import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { ShieldCheck, Loader2, ArrowRight, UserPlus, Lock, Mail, PartyPopper, Users, User, LogOut } from "lucide-react";

export default function PublicRegistration() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const clubId = searchParams.get("club");
  const torneoId = searchParams.get("torneo");

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Contexto del club y torneo
  const [clubData, setClubData] = useState<any>(null);
  const [torneoData, setTorneoData] = useState<any>(null);
  const [equipos, setEquipos] = useState<any[]>([]);

  // Inteligencia de Sesión
  const [authUser, setAuthUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [existingPlayers, setExistingPlayers] = useState<any[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('NEW');

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    playerName: "",
    playerDni: "",
    playerDob: "",
    actualTeam: "",
    position: "",
    equipoId: ""
  });

  useEffect(() => {
    checkSession();
    if (clubId && torneoId) {
      fetchContextData();
    } else {
      setErrorMsg("Enlace inválido. Faltan parámetros del club o torneo.");
      setLoadingInitial(false);
    }
  }, [clubId, torneoId]);

  // 1. Verificar si el usuario ya está logueado
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setAuthUser(session.user);
      fetchExistingPlayers(session.user.id);
    }
  };

  // 2. Si está logueado, buscar si ya tiene hijos registrados
  const fetchExistingPlayers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('player_guardians')
        .select('jugadores(*)')
        .eq('family_profile_id', userId);
        
      if (!error && data) {
        // Extraemos los jugadores del objeto anidado
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
      if (club) setClubData(club);

      const { data: torneo } = await supabase.from('torneos').select('*').eq('id', torneoId).single();
      if (torneo) setTorneoData(torneo);

      const { data: teams } = await supabase
        .from('equipos')
        .select('*')
        .eq('club_id', clubId)
        .eq('torneo_id', torneoId); 
      
      if (teams) setEquipos(teams);
    } catch (err) {
      setErrorMsg("Error cargando la información de la entidad.");
    } finally {
      setLoadingInitial(false);
    }
  };

  // 3. Manejar Login Manual si eligen "Ya tengo cuenta"
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

  // 4. El Gran Gestor de Inscripciones (El cerebro principal)
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      let currentUserId = authUser?.id;

      // ESCENARIO A: Crear cuenta nueva
      if (!currentUserId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;
        currentUserId = authData.user?.id;
        if (!currentUserId) throw new Error("No se pudo crear el usuario.");

        // Crear Perfil de Familia
        const nameParts = formData.playerName.trim().split(' ');
        const { error: profileError } = await supabase.from('profiles').upsert({ 
          id: currentUserId, 
          role: 'family',
          email: formData.email,
          full_name: nameParts[0], // Usamos el nombre del niño como ref si no hay otro
          system_role: 'user',
          club_id: clubId 
        });
        if (profileError) throw profileError;
      }

      let targetPlayerId = selectedPlayerId;

      // ESCENARIO B: Necesitamos crear al jugador porque es nuevo
      if (targetPlayerId === 'NEW') {
        const nameParts = formData.playerName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';
        targetPlayerId = crypto.randomUUID();

        // Crear Jugador
        const { error: playerError } = await supabase.from('jugadores').insert([{
          id: targetPlayerId,
          name: firstName,
          surname: lastName,
          dni: formData.playerDni,
          birth_date: formData.playerDob,
          actual_team: formData.actualTeam,
          position: formData.position,
          status: 'activo'
        }]);
        if (playerError) throw playerError;

        // Vincular Padre-Hijo
        const { error: guardianError } = await supabase.from('player_guardians').insert([{
          player_id: targetPlayerId,
          family_profile_id: currentUserId
        }]);
        if (guardianError) throw guardianError;
      }

      // ESCENARIO C: Inscribir en el Torneo al jugador (sea nuevo o existente)
      if (torneoId && targetPlayerId) {
        // Primero comprobamos si ya está inscrito para evitar duplicados
        const { data: checkInscripcion } = await supabase
          .from('torneo_jugadores')
          .select('id')
          .eq('torneo_id', torneoId)
          .eq('player_id', targetPlayerId)
          .single();

        if (checkInscripcion) {
          throw new Error("Este jugador ya está inscrito en este torneo.");
        }

        const { error: torneoJugadorError } = await supabase.from('torneo_jugadores').insert([{
          torneo_id: torneoId,
          player_id: targetPlayerId,
          team_id: formData.equipoId || null,
          club_id: clubId, 
          status: 'inscrito'
        }]);
        if (torneoJugadorError) throw torneoJugadorError;
      }

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

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#05080f] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-neon/5 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-xl bg-[#162032]/90 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 shadow-2xl relative z-10">
        <div className="text-center mb-10 pb-8 border-b border-white/5">
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">{clubData?.name}</h1>
          <p className="text-brand-neon font-bold text-xs mt-2 uppercase tracking-widest">{torneoData?.name}</p>
        </div>

        {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-center font-bold animate-in shake">{errorMsg}</div>}

        {/* SI NO ESTÁ LOGUEADO -> Mostramos los botones y inputs de Auth */}
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
              // FORMULARIO DE LOGIN (Solo email y pass)
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
              // FORMULARIO DE REGISTRO COMPLETO
              <form onSubmit={handleRegistration} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-brand-neon tracking-widest flex items-center gap-2"><UserPlus size={14}/> Datos del Tutor</h3>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input required type="email" placeholder="Email del padre/madre" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-brand-neon" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input required type="password" placeholder="Crea una contraseña" minLength={6} className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-brand-neon" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2"><ShieldCheck size={14}/> Datos del Jugador</h3>
                  <input required type="text" placeholder="Nombre completo del niño" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 font-bold" value={formData.playerName} onChange={e => setFormData({...formData, playerName: e.target.value})} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" placeholder="DNI" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400" value={formData.playerDni} onChange={e => setFormData({...formData, playerDni: e.target.value})} />
                    <input required type="date" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 color-scheme-dark" value={formData.playerDob} onChange={e => setFormData({...formData, playerDob: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" placeholder="Equipo Procedencia (Ej: FCB Benjamín)" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400" value={formData.actualTeam} onChange={e => setFormData({...formData, actualTeam: e.target.value})} />
                    <select required className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-slate-300 outline-none focus:border-blue-400 appearance-none" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
                      <option value="" disabled>Posición Principal</option>
                      <option value="Portero">Portero</option>
                      <option value="Defensa">Defensa</option>
                      <option value="Centrocampista">Centrocampista</option>
                      <option value="Delantero">Delantero</option>
                    </select>
                  </div>
                  
                  <div className="relative mt-2">
                    <select required className="w-full bg-[#0a0f18] border border-brand-neon/50 rounded-2xl p-4 text-white outline-none focus:border-brand-neon appearance-none font-bold shadow-[0_0_15px_rgba(163,230,53,0.1)]" value={formData.equipoId} onChange={e => setFormData({...formData, equipoId: e.target.value})}>
                      <option value="">Selecciona Categoría a inscribir</option>
                      {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full bg-brand-neon hover:bg-white text-brand-deep font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                  {submitting ? <Loader2 className="animate-spin" size={24} /> : <>CONFIRMAR INSCRIPCIÓN <ArrowRight size={20} /></>}
                </button>
              </form>
            )}
          </>
        ) : (

          // SI YA ESTÁ LOGUEADO -> Interfaz de One-Click Enrollment
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
                    <span className="text-[10px] font-black uppercase opacity-50">{player.position || 'Jugador'}</span>
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

            {/* Si elige "Nuevo Jugador", mostramos sus campos */}
            {selectedPlayerId === 'NEW' && (
              <div className="space-y-4 p-6 bg-black/20 rounded-3xl border border-white/5 animate-in slide-in-from-top-4">
                <input required type="text" placeholder="Nombre completo" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400" value={formData.playerName} onChange={e => setFormData({...formData, playerName: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="DNI" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400" value={formData.playerDni} onChange={e => setFormData({...formData, playerDni: e.target.value})} />
                  <input required type="date" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 color-scheme-dark" value={formData.playerDob} onChange={e => setFormData({...formData, playerDob: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="Equipo Procedencia" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400" value={formData.actualTeam} onChange={e => setFormData({...formData, actualTeam: e.target.value})} />
                  <select required className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-slate-300 outline-none focus:border-blue-400 appearance-none" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
                    <option value="" disabled>Posición Principal</option>
                    <option value="Portero">Portero</option>
                    <option value="Defensa">Defensa</option>
                    <option value="Centrocampista">Centrocampista</option>
                    <option value="Delantero">Delantero</option>
                  </select>
                </div>
              </div>
            )}

            <div className="relative border-t border-white/5 pt-6">
              <label className="text-[10px] font-black uppercase text-brand-neon tracking-widest block mb-3 ml-2">Destino de la Inscripción</label>
              <select required className="w-full bg-[#0a0f18] border border-brand-neon/50 rounded-2xl p-4 text-white outline-none focus:border-brand-neon appearance-none font-bold shadow-[0_0_15px_rgba(163,230,53,0.1)]" value={formData.equipoId} onChange={e => setFormData({...formData, equipoId: e.target.value})}>
                <option value="">Selecciona Categoría en {clubData?.name}</option>
                {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
              </select>
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