import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { Loader2, Shield, Lock, Mail, User, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ClubRegister() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clubId = searchParams.get("id");

  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!clubId) {
      setError("Enlace de invitación inválido. Falta el identificador del club.");
      setLoading(false);
      return;
    }

    const fetchClub = async () => {
      const { data, error } = await supabase.from('clubs').select('*').eq('id', clubId).single();
      if (error || !data) {
        setError("El club no existe o la invitación ha caducado.");
      } else {
        setClub(data);
      }
      setLoading(false);
    };

    fetchClub();
  }, [clubId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsRegistering(true);

    try {
      // 1. Crear el usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // 2. Crear el Perfil (Role: 'club')
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          full_name: fullName,
          role: 'club',
          club_id: clubId
        }
      ]);

      if (profileError) throw new Error("Error vinculando el perfil al club");

      setSuccess(true);
      
      // 3. Iniciar sesión automáticamente (Supabase Auth suele auto-loguear en signUp si no hay email config)
      // Redirigimos al dashboard del club
      setTimeout(() => {
        navigate('/club-dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setIsRegistering(false);
    }
  };

  const getLogoUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('club-logos').getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 size={40} className="text-brand-neon animate-spin mb-4" />
        <p className="text-brand-neon font-black uppercase tracking-widest animate-pulse">Preparando entorno...</p>
      </div>
    );
  }

  if (error && !club) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Shield size={60} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Acceso Denegado</h1>
        <p className="text-slate-400 font-bold max-w-md">{error}</p>
        <button onClick={() => navigate('/')} className="mt-8 px-8 py-3 bg-white/10 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-colors">Volver al inicio</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 rounded-full bg-brand-neon/10 flex items-center justify-center text-brand-neon mb-6 border-2 border-brand-neon">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter mb-2">¡Bienvenido al Club!</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Preparando tu Panel de Control...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* CABECERA CON EL CLUB */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto rounded-[32px] bg-[#162032] border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl mb-6 relative">
             <div className="absolute inset-0 bg-brand-neon/10"></div>
             {club?.logo_path ? (
               <img src={getLogoUrl(club.logo_path)} alt="Escudo" className="w-full h-full object-contain p-2 relative z-10" />
             ) : (
               <Shield size={32} className="text-slate-500 relative z-10" />
             )}
          </div>
          <p className="text-[10px] font-black text-brand-neon uppercase tracking-[0.3em] mb-2">Alta de Gestor Oficial</p>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase italic tracking-tighter leading-none">
            {club?.name}
          </h1>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleRegister} className="bg-[#162032]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/5 rounded-full blur-[80px] pointer-events-none"></div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5 relative z-10">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                required
                type="text"
                placeholder="Ej: Carlos Director"
                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white text-sm font-bold placeholder:text-slate-600 focus:border-brand-neon outline-none transition-all"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5 relative z-10">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                required
                type="email"
                placeholder="tu@correo.com"
                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white text-sm font-bold placeholder:text-slate-600 focus:border-brand-neon outline-none transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5 relative z-10">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Contraseña de Acceso</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                required
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white text-sm font-bold placeholder:text-slate-600 focus:border-brand-neon outline-none transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isRegistering}
            className="w-full bg-brand-neon text-brand-deep font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl hover:bg-white transition-all shadow-[0_0_20px_rgba(var(--brand-neon-rgb),0.3)] active:scale-95 flex items-center justify-center gap-2 mt-4 relative z-10"
          >
            {isRegistering ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={18} /> Activar Panel de Club</>}
          </button>
        </form>

      </div>
    </div>
  );
}