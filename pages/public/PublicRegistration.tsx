import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { ShieldCheck, Trophy, Loader2, ArrowRight, UserPlus, Lock, Mail, PartyPopper } from "lucide-react";

export default function PublicRegistration() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const clubId = searchParams.get("club");
  const torneoId = searchParams.get("torneo");

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [clubData, setClubData] = useState<any>(null);
  const [torneoData, setTorneoData] = useState<any>(null);
  const [equipos, setEquipos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    playerName: "",
    playerDni: "",
    playerDob: "",
    actualTeam: "", // NUEVO: Equipo Origen
    position: "",   // NUEVO: Posición Principal
    equipoId: ""
  });

  useEffect(() => {
    if (clubId && torneoId) fetchContextData();
    else {
      setErrorMsg("Enlace inválido. Faltan parámetros.");
      setLoadingInitial(false);
    }
  }, [clubId, torneoId]);

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
      setErrorMsg("Error cargando la información.");
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("No se pudo crear el usuario.");

      const nameParts = formData.playerName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // 2. Crear Perfil de Familia
      const { error: profileError } = await supabase.from('profiles').upsert({ 
        id: userId, 
        role: 'family',
        email: formData.email,
        full_name: formData.playerName,
        system_role: 'user',
        club_id: clubId 
      });
      if (profileError) throw profileError;

      const newPlayerId = crypto.randomUUID();

      // 3. Crear al Jugador con los nuevos campos
      const { error: playerError } = await supabase.from('jugadores').insert([{
        id: newPlayerId,
        name: firstName,
        surname: lastName,
        dni: formData.playerDni,
        birth_date: formData.playerDob,
        actual_team: formData.actualTeam, // Guardamos el equipo de procedencia
        position: formData.position,     // Guardamos la posición
        status: 'activo'
      }]);
      if (playerError) throw playerError;

      // 4. Vincular Padre-Hijo
      const { error: guardianError } = await supabase.from('player_guardians').insert([{
        player_id: newPlayerId,
        family_profile_id: userId
      }]);
      if (guardianError) throw guardianError;

      // 5. Inscribir en el Torneo (Tabla Pivote)
      if (torneoId) {
        const { error: torneoJugadorError } = await supabase.from('torneo_jugadores').insert([{
          torneo_id: torneoId,
          player_id: newPlayerId,
          team_id: formData.equipoId || null,
          club_id: clubId, 
          status: 'inscrito'
        }]);
        if (torneoJugadorError) throw torneoJugadorError;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/family-dashboard");
      }, 1500);

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
      <p className="text-slate-400 text-lg">Iniciando tu sesión segura...</p>
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

        <form onSubmit={handleRegistration} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-brand-neon tracking-widest flex items-center gap-2"><UserPlus size={14}/> Datos del Tutor</h3>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-neon transition-colors" size={20} />
              <input required type="email" placeholder="Email del padre/madre" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-brand-neon transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-neon transition-colors" size={20} />
              <input required type="password" placeholder="Crea una contraseña" middle={6} className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-brand-neon transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2"><ShieldCheck size={14}/> Datos del Jugador</h3>
            <input required type="text" placeholder="Nombre completo del niño" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 transition-all font-bold" value={formData.playerName} onChange={e => setFormData({...formData, playerName: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="DNI" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 transition-all" value={formData.playerDni} onChange={e => setFormData({...formData, playerDni: e.target.value})} />
              <input required type="date" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 transition-all color-scheme-dark" value={formData.playerDob} onChange={e => setFormData({...formData, playerDob: e.target.value})} />
            </div>

            {/* 👇 NUEVOS CAMPOS: Equipo Origen y Posición 👇 */}
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="Equipo Procedencia (Ej: FCB Benjamín)" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-400 transition-all" value={formData.actualTeam} onChange={e => setFormData({...formData, actualTeam: e.target.value})} />
              <div className="relative">
                <select 
                  required 
                  className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-slate-300 outline-none focus:border-blue-400 transition-all appearance-none" 
                  value={formData.position} 
                  onChange={e => setFormData({...formData, position: e.target.value})}
                >
                  <option value="" disabled>Posición Principal</option>
                  <option value="Portero">Portero</option>
                  <option value="Defensa">Defensa</option>
                  <option value="Centrocampista">Centrocampista</option>
                  <option value="Delantero">Delantero</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ArrowRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>
            
            <div className="relative mt-2">
              <select 
                required 
                className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-neon transition-all appearance-none font-bold" 
                value={formData.equipoId} 
                onChange={e => setFormData({...formData, equipoId: e.target.value})}
              >
                <option value="">Selecciona Categoría para {torneoData?.name}</option>
                {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ArrowRight size={16} className="rotate-90" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-brand-neon hover:bg-white text-brand-deep font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(163,230,53,0.3)]">
            {submitting ? <Loader2 className="animate-spin" size={24} /> : <>CONFIRMAR INSCRIPCIÓN <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}