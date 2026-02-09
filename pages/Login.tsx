import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

type Mode = "team" | "admin" | "family";

interface Props {
  mode: Mode;
}

export interface AppSession {
  email: string;
  userId: string;
  role: "team" | "admin" | "family";
  clubId: string | null;
}

const Login: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();

  const title = useMemo(() => {
    if (mode === "team") return "Login TEAM";
    if (mode === "admin") return "Login ADMIN";
    return "Login FAMILY";
  }, [mode]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goByRole = (session: AppSession) => {
    localStorage.setItem("session", JSON.stringify(session));

    if (session.role === "admin") {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (session.role === "team") {
      navigate("/team-dashboard", { replace: true });
      return;
    }

    navigate("/family-dashboard", { replace: true });
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    // 1️⃣ Auth
    const { data, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !data.user) {
      setError("Credenciales incorrectas.");
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    // 2️⃣ Leer profile (SOLO columnas reales)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, email, club_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error(profileError);
      setError("Error leyendo perfil.");
      setLoading(false);
      return;
    }

    // 3️⃣ Validación por modo
    if (profile.role !== "admin" && profile.role !== mode) {
      setError(
        `Este usuario es '${profile.role}' y estás entrando como '${mode}'.`
      );
      setLoading(false);
      return;
    }

    // 4️⃣ Construir sesión (LIMPIA)
    const session: AppSession = {
      email: profile.email ?? email,
      userId,
      role: profile.role,
      clubId: profile.club_id ?? null,
    };

    goByRole(session);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-deep">
      <div className="bg-brand-surface p-8 rounded-2xl w-full max-w-md border border-white/10">
        <h1 className="text-2xl font-bold mb-2 text-white">{title}</h1>
        <p className="text-sm text-slate-400 mb-6">
          Accede con tu cuenta (Supabase Auth).
        </p>

        <input
          className="w-full mb-3 p-3 rounded bg-black/30 text-white border border-white/10"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-4 p-3 rounded bg-black/30 text-white border border-white/10"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 mb-3">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-brand-neon text-brand-deep font-bold py-3 rounded disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
};

export default Login;
