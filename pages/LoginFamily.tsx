import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import Logo from "../components/branding/Logo";

type Role = "admin" | "team" | "family";

interface SessionData {
  email: string;
  role: Role;
  teamId: string | null;
  playerId: string | null;
}

const LoginFamily: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("family@test.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    // 1) Login Supabase Auth (profesional)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError("Credenciales incorrectas.");
      setLoading(false);
      return;
    }

    // 2) Leer profile y verificar role = family
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, email, team_id, player_id")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      setError("No existe perfil para este usuario (profiles).");
      setLoading(false);
      return;
    }

    if (profile.role !== "family") {
      setError("Tu usuario no tiene acceso al portal FAMILY.");
      setLoading(false);
      return;
    }

    const session: SessionData = {
      email: profile.email ?? email,
      role: "family",
      teamId: profile.team_id ?? null,
      playerId: profile.player_id ?? null,
    };

    localStorage.setItem("session", JSON.stringify(session));
    navigate("/family-dashboard");
  };

  return (
    <div className="min-h-screen bg-brand-deep text-white flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute -left-40 top-1/3 w-[520px] h-[520px] bg-purple-600/20 blur-[120px]" />
      <div className="absolute -right-40 top-1/4 w-[520px] h-[520px] bg-brand-neon/15 blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-10">
          <Logo />
          <p className="text-sm text-white/60 mt-3">Accede al portal familiar</p>
        </div>

        <div className="bg-brand-surface/80 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white">Login FAMILY</h1>
          <p className="text-sm text-slate-400 mt-1">
            Información del torneo, pagos y documentación del jugador.
          </p>

          <div className="mt-6 space-y-3">
            <input
              className="w-full p-3 rounded-xl bg-black/30 border border-white/10 text-white outline-none focus:border-purple-400/60"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full p-3 rounded-xl bg-black/30 border border-white/10 text-white outline-none focus:border-purple-400/60"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-6 w-full bg-purple-500/90 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-xs text-white/40 mt-4">
            Demo: family@test.com / 123456
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginFamily;
