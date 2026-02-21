import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { Loader2, ArrowRight, Lock, Mail, PartyPopper, User, ShieldCheck, CreditCard, Link as LinkIcon, Shield } from "lucide-react";

// Función auxiliar para obtener logos
const getImageUrl = (path: string | null, bucket: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export default function LinkPlayer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const playerId = searchParams.get("player");

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [playerData, setPlayerData] = useState<any>(null);
  const [clubData, setClubData] = useState<any>(null);
  const [clubLogo, setClubLogo] = useState<string | null>(null);
  
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    parentName: "",
    parentDni: ""
  });

  useEffect(() => {
    if (playerId) {
      fetchPlayerData();
    } else {
      setErrorMsg("Enlace inválido. Falta el identificador del jugador.");
      setLoadingInitial(false);
    }
  }, [playerId]);

  const fetchPlayerData = async () => {
    try {
      // 🔥 LA MAGIA SEGURA: Llamamos a la función RPC en lugar de hacer Select a las tablas
      const { data: publicInfo, error } = await supabase.rpc('get_public_player_link_info', {
        p_player_id: playerId
      });

      if (error) throw error;
      
      if (publicInfo) {
        // Rellenamos los estados con lo que nos ha devuelto el "Cajero Automático"
        setPlayerData({ 
          name: publicInfo.name, 
          surname: publicInfo.surname 
        });
        
        if (publicInfo.club_name) {
          setClubData({ name: publicInfo.club_name });
          setClubLogo(getImageUrl(publicInfo.club_logo, 'club-logos'));
        }
      } else {
        setErrorMsg("No se ha encontrado a este jugador o el enlace ha caducado.");
      }
    } catch (err) {
      console.error("Error cargando jugador:", err);
      setErrorMsg("No se pudo cargar la información del jugador.");
    } finally {
      setLoadingInitial(false);
    }
  };

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(pwd)) return "La contraseña debe incluir al menos una letra mayúscula.";
    if (!/[0-9]/.test(pwd)) return "La contraseña debe incluir al menos un número.";
    return null;
  };

  const handleLinkProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId) return;
    
    setSubmitting(true);
    setErrorMsg("");

    try {
      let currentUserId = null;

      if (authMode === 'signup') {
        const pwdError = validatePassword(formData.password);
        if (pwdError) {
          setSubmitting(false);
          setErrorMsg(pwdError);
          return;
        }

        // 1. Crear nuevo usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;
        currentUserId = authData.user?.id;
        if (!currentUserId) throw new Error("No se pudo crear el usuario.");

        // 2. Guardar su perfil como padre (family)
        const { error: profileError } = await supabase.from('profiles').upsert({ 
          id: currentUserId, 
          role: 'family',
          email: formData.email,
          full_name: formData.parentName.trim(), 
          dni: formData.parentDni.trim(), 
          system_role: 'user'
        });
        if (profileError) throw profileError;

      } else {
        // 1. Login de usuario existente
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (authError) throw new Error("Credenciales incorrectas.");
        currentUserId = authData.user?.id;
      }

      // 3. VINCULAR JUGADOR A LA FAMILIA
      if (currentUserId) {
        // Primero comprobamos si ya está vinculado para no duplicar
        const { data: checkLink } = await supabase.from('player_guardians')
          .select('id')
          .eq('player_id', playerId)
          .eq('family_profile_id', currentUserId)
          .single();

        if (!checkLink) {
          const { error: guardianError } = await supabase.from('player_guardians').insert([{
            player_id: playerId,
            family_profile_id: currentUserId,
            relationship: 'Tutor Legal' // Opcional, pero queda bien en BBDD
          }]);
          if (guardianError) throw guardianError;
        }
      }

      setSuccess(true);
      setTimeout(() => navigate("/family-dashboard"), 1500);

    } catch (err: any) {
      console.error("🚨 Error:", err);
      setErrorMsg(err.message || "Error durante la vinculación.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05080f] text-center p-6">
      <div className="w-24 h-24 bg-brand-neon rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_50px_rgba(163,230,53,0.5)]">
        <PartyPopper size={48} className="text-brand-deep" />
      </div>
      <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">¡CUENTA VINCULADA!</h2>
      <p className="text-slate-400 text-lg">Iniciando tu sesión en TeamFlow...</p>
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

      <div className="w-full max-w-md bg-[#162032]/90 backdrop-blur-xl border border-white/10 rounded-[40px] p-6 md:p-8 shadow-2xl relative z-10">
        
        {/* 🔥 HEADER CON DATOS SEGUROS DE BBDD */}
        <div className="text-center mb-8 pb-6 border-b border-white/5">
          {clubLogo ? (
            <div className="w-20 h-20 mx-auto bg-white rounded-2xl p-2 shadow-xl mb-4 border border-white/20">
              <img src={clubLogo} alt={clubData?.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto bg-brand-neon/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-neon/20">
              <Shield size={32} className="text-brand-neon" />
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tight">
            {clubData ? clubData.name : "Vincular Cuenta"}
          </h1>
          
          {playerData && (
            <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl inline-block mx-auto">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 flex items-center justify-center gap-1.5">
                <LinkIcon size={12} /> Gestión Autorizada
              </p>
              <p className="font-bold text-sm text-white uppercase tracking-wider">
                {playerData.name} {playerData.surname}
              </p>
            </div>
          )}
        </div>

        {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-center font-bold animate-in shake">{errorMsg}</div>}

        <div className="flex bg-[#0a0f18] p-1 rounded-2xl mb-8 border border-white/5">
          <button 
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'signup' ? 'bg-brand-neon text-black shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Soy Nuevo Tutor
          </button>
          <button 
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'login' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Ya tengo cuenta
          </button>
        </div>

        <form onSubmit={handleLinkProcess} className="space-y-6">
          
          {authMode === 'signup' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 mb-6">
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2">Datos del Responsable</p>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input required type="text" placeholder="Tu Nombre y Apellidos (Tutor)" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-white outline-none focus:border-brand-neon text-sm" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
              </div>
              <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input required type="text" placeholder="Tu DNI / Pasaporte" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-white outline-none focus:border-brand-neon text-sm uppercase" value={formData.parentDni} onChange={e => setFormData({...formData, parentDni: e.target.value})} />
              </div>
            </div>
          )}

          <div className="space-y-4">
            {authMode === 'signup' && <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2 pt-2 border-t border-white/5">Credenciales de Acceso</p>}
            
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-brand-neon transition-colors" size={18} />
              <input required type="email" placeholder="Correo Electrónico" className="w-full bg-[#0a0f18] border-2 border-blue-500/30 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-brand-neon focus:bg-[#0D1B2A] transition-all shadow-[0_0_15px_rgba(59,130,246,0.05)]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-brand-neon transition-colors" size={18} />
                <input required type="password" placeholder="Contraseña Segura" minLength={8} className="w-full bg-[#0a0f18] border-2 border-blue-500/30 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-brand-neon focus:bg-[#0D1B2A] transition-all shadow-[0_0_15px_rgba(59,130,246,0.05)]" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              {authMode === 'signup' && (
                <p className="text-[9px] text-slate-500 font-bold ml-2">Mín. 8 caracteres, 1 mayúscula y 1 número.</p>
              )}
            </div>
          </div>

          <button type="submit" disabled={submitting} className={`w-full ${authMode === 'signup' ? 'bg-brand-neon text-black hover:bg-white' : 'bg-blue-500 text-white hover:bg-blue-400'} font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-3 mt-8 shadow-[0_0_30px_rgba(var(--brand-neon-rgb),0.2)] active:scale-95`}>
            {submitting ? <Loader2 className="animate-spin" size={24} /> : <>VINCULAR Y ENTRAR <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}