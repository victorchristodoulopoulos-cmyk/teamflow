import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import Logo from "../components/branding/Logo";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

type Mode = "team" | "admin" | "family" | "club";

interface Props {
  mode: Mode;
}

export interface AppSession {
  email: string;
  userId: string;
  role: "team" | "admin" | "family" | "club" | "org_admin" | "super_admin";
  clubId: string | null;
}

const Login: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();

  const settings = useMemo(() => {
    const base = {
      team: { 
        title: "Login TEAM", 
        desc: "Gestión operativa para entrenadores y staff técnico.", 
        color: "bg-brand-neon", 
        glow: "bg-brand-neon/20",
        border: "focus:border-brand-neon/60"
      },
      admin: { 
        title: "Login ADMIN", 
        desc: "Panel de control maestro de la plataforma.", 
        color: "bg-sky-400", 
        glow: "bg-sky-400/20",
        border: "focus:border-sky-400/60"
      },
      club: { 
        title: "Login CLUB", 
        desc: "Dirección y gestión integral de la entidad.", 
        color: "bg-blue-500", 
        glow: "bg-blue-500/20",
        border: "focus:border-blue-500/60"
      },
      family: { 
        title: "Login FAMILY", 
        desc: "Información del torneo, pagos y documentación.", 
        color: "bg-purple-500", 
        glow: "bg-purple-500/20",
        border: "focus:border-purple-400/60"
      },
    };
    return base[mode];
  }, [mode]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Lógica de redirección basada en el rol de la base de datos
  const goByRole = (session: AppSession) => {
    localStorage.setItem("session", JSON.stringify(session));
    
    if (session.role === "super_admin") {
      navigate("/admin/clubs", { replace: true });
    } 
    else if (session.role === "admin") {
      navigate("/dashboard", { replace: true });
    } 
    else if (session.role === "club" || session.role === "org_admin") {
      navigate("/club-dashboard", { replace: true });
    } 
    else if (session.role === "team") {
      navigate("/team-dashboard", { replace: true });
    } 
    else {
      navigate("/family-dashboard", { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError("Credenciales incorrectas.");
      setLoading(false);
      return;
    }

    const userId = data.user.id;
    // Buscamos el rol en la tabla profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, email, club_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      setError("Error leyendo perfil de usuario.");
      setLoading(false);
      return;
    }

    // Verificamos si el usuario tiene permiso para entrar por este portal
    // El super_admin tiene permiso para entrar por cualquier portal administrativo
    const isAccessAllowed = 
      profile.role === "super_admin" || 
      (mode === "admin" && profile.role === "admin") ||
      (mode === "team" && (profile.role === "team" || profile.role === "admin")) ||
      (mode === "club" && (profile.role === "club" || profile.role === "org_admin")) ||
      (mode === "family" && profile.role === "family");

    if (!isAccessAllowed) {
      setError(`Acceso denegado. Tu rol es '${profile.role}'.`);
      setLoading(false);
      return;
    }

    const session: AppSession = {
      email: profile.email ?? email,
      userId,
      role: profile.role,
      clubId: profile.club_id ?? null,
    };

    goByRole(session);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-deep text-white flex items-center justify-center px-6 relative overflow-hidden">
      
      {/* Efectos de fondo */}
      <div className={`absolute -left-40 top-1/3 w-[520px] h-[520px] ${settings.glow} blur-[120px] rounded-full`} />
      <div className="absolute -right-40 top-1/4 w-[520px] h-[520px] bg-brand-neon/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        
        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <Logo />
          <p className="text-sm text-white/40 mt-3 font-medium tracking-wide uppercase">
            Portal Oficial TeamFlow
          </p>
        </div>

        <form 
          onSubmit={handleLogin} 
          className="bg-brand-surface/60 border border-white/10 backdrop-blur-2xl rounded-[32px] p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-500"
        >
          
          <div className="mb-8">
            <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
              {settings.title}
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {settings.desc}
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
              <input
                required
                className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border border-white/5 text-white outline-none transition-all ${settings.border}`}
                placeholder="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
              <input
                required
                className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border border-white/5 text-white outline-none transition-all ${settings.border}`}
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-xs font-bold text-center uppercase tracking-tight">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mt-8 w-full ${settings.color} text-brand-deep font-black py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 group`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span className="uppercase tracking-widest text-sm">Entrar al Portal</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-white/20 mt-8 uppercase tracking-[0.3em] font-bold">
          TeamFlow High Performance Management
        </p>
      </div>
    </div>
  );
};

export default Login;