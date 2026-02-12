import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import Logo from "../../components/branding/Logo";
import { Lock, User, ArrowRight, Loader2, ShieldCheck, Mail } from "lucide-react";

export default function TeamRegister() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Capturamos los datos del Link
  const emailParam = searchParams.get("email") || "";
  const clubIdParam = searchParams.get("clubId") || "";
  const teamIdParam = searchParams.get("teamId") || "";

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Registrar usuario en Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: emailParam,
        password: password,
        options: {
          data: { full_name: fullName, role: 'team' } 
        }
      });

      if (authError) throw authError;
      if (!data.user) throw new Error("No se pudo crear el usuario");

      // 2. Crear/Actualizar Perfil (Rol Team)
      // Usamos upsert por si el usuario existía pero estaba incompleto
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          email: emailParam,
          full_name: fullName,
          role: "team",
          club_id: clubIdParam
        });

      if (profileError) throw profileError;

      // 3. Vincular al Equipo (La clave de todo)
      if (teamIdParam) {
        const { error: teamError } = await supabase.from("team_users").insert({
          profile_id: data.user.id,
          team_id: teamIdParam,
          club_id: clubIdParam
        });
        if (teamError) throw teamError;
      }

      // 4. Auto-Login y Redirección al Dashboard del Entrenador
      await supabase.auth.signInWithPassword({ email: emailParam, password });
      navigate("/team-dashboard");

    } catch (err: any) {
      console.error(err);
      // Si el error es "User already registered", intentamos hacer login o avisar
      if (err.message?.includes("already registered")) {
         setError("Este usuario ya existe. Intenta iniciar sesión normalmente.");
      } else {
         setError(err.message || "Error al activar la cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!emailParam || !clubIdParam) return (
    <div className="min-h-screen bg-brand-deep flex items-center justify-center text-white">
        <p>Enlace de invitación incompleto o inválido.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-deep text-white flex items-center justify-center px-6 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -left-20 top-1/4 w-96 h-96 bg-brand-neon/10 rounded-full blur-[100px]"></div>
         <div className="absolute -right-20 bottom-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Logo />
          <h2 className="text-3xl font-display font-black italic mt-6 uppercase tracking-tighter">Activación Staff</h2>
          <p className="text-slate-400 text-sm font-medium">Configura tu acceso para gestionar el equipo.</p>
        </div>

        <form onSubmit={handleRegister} className="bg-[#162032] border border-white/10 p-8 rounded-[32px] space-y-6 shadow-2xl backdrop-blur-sm">
          
          {/* Tarjeta de Invitación */}
          <div className="p-4 bg-brand-neon/5 rounded-xl border border-brand-neon/20 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-brand-neon/20 flex items-center justify-center text-brand-neon">
                <ShieldCheck size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-brand-neon uppercase tracking-widest mb-0.5">Invitado como</p>
                <p className="text-white font-bold text-sm truncate max-w-[200px]">{emailParam}</p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nombre Completo</label>
                <div className="relative group">
                   <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                   <input 
                     required
                     className="w-full pl-12 pr-4 py-3 bg-[#0D1B2A] border border-white/10 rounded-2xl focus:border-brand-neon outline-none text-white transition-all font-medium"
                     placeholder="Ej: Pep Guardiola"
                     value={fullName}
                     onChange={e => setFullName(e.target.value)}
                   />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Crear Contraseña</label>
                <div className="relative group">
                   <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                   <input 
                     required
                     type="password"
                     minLength={6}
                     className="w-full pl-12 pr-4 py-3 bg-[#0D1B2A] border border-white/10 rounded-2xl focus:border-brand-neon outline-none text-white transition-all font-medium"
                     placeholder="Mínimo 6 caracteres"
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                   />
                </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <p className="text-red-400 text-xs font-bold uppercase">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-4 bg-brand-neon text-brand-deep font-black uppercase rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2 shadow-lg shadow-brand-neon/20">
            {loading ? <Loader2 className="animate-spin" /> : <>Activar y Entrar <ArrowRight size={18} strokeWidth={3}/></>}
          </button>
        </form>
      </div>
    </div>
  );
}