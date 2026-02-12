import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import Logo from "../components/branding/Logo";

type Role = "admin" | "team" | "family";

interface SessionData {
  email: string;
  role: Role;

}

type ProfileRow = {
  id: string;
  role: Role;
  email: string | null;

};

function friendlySupabaseError(e: any) {
  const msg =
    e?.message ||
    e?.error_description ||
    (typeof e === "string" ? e : JSON.stringify(e));
  return msg ?? "Unknown error";
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

    // 1) Login Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      setError(`Credenciales incorrectas. (${friendlySupabaseError(authError)})`);
      setLoading(false);
      return;
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email ?? email;

    // 2) Try to read profile by ID (correct way)
    let profile: ProfileRow | null = null;

    const byId = await supabase
      .from("profiles")
      .select("id, role, email")
      .eq("id", userId)
      .maybeSingle();

    if (byId.error) {
      // IMPORTANT: this is often RLS / permissions
      setError(
        `No puedo leer profiles (por ID). Posible RLS/permisos. Error: ${friendlySupabaseError(
          byId.error
        )}`
      );
      setLoading(false);
      return;
    }

    profile = (byId.data as ProfileRow | null) ?? null;

    // 3) If not found, fallback by email (helps diagnose mismatch)
    if (!profile) {
      const byEmail = await supabase
        .from("profiles")
        .select("id, role, email")
        .eq("email", userEmail)
        .maybeSingle();

      if (byEmail.error) {
        setError(
          `No puedo leer profiles (por email). Posible RLS/permisos. Error: ${friendlySupabaseError(
            byEmail.error
          )}`
        );
        setLoading(false);
        return;
      }

      if (byEmail.data) {
        // Found a profile but with different ID => data mismatch in DB
        setError(
          `Tu perfil existe pero su ID NO coincide con auth.users.id.\n\n` +
            `auth id: ${userId}\n` +
            `profile id: ${(byEmail.data as ProfileRow).id}\n\n` +
            `Solución: hay que arreglar el profile en Supabase (te paso SQL abajo).`
        );
        setLoading(false);
        return;
      }
    }

    // 4) If still not found => create profile automatically with correct auth id
    if (!profile) {
      const insertRes = await supabase
        .from("profiles")
        .insert({
          id: userId,
          role: "family",
          email: userEmail,
        })
        .select("id, role, email")
        .single();

      if (insertRes.error || !insertRes.data) {
        setError(
          `No existe perfil y no puedo crearlo (INSERT). Posible RLS/permisos. Error: ${friendlySupabaseError(
            insertRes.error
          )}`
        );
        setLoading(false);
        return;
      }

      profile = insertRes.data as ProfileRow;
    }

    // 5) Enforce role
    if (profile.role !== "family") {
      setError("Tu usuario no tiene acceso al portal FAMILY.");
      setLoading(false);
      return;
    }

    const session: SessionData = {
      email: profile.email ?? userEmail,
      role: "family",
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
              autoComplete="email"
            />

            <input
              className="w-full p-3 rounded-xl bg-black/30 border border-white/10 text-white outline-none focus:border-purple-400/60"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <pre className="whitespace-pre-wrap text-red-400 text-xs mt-4">
              {error}
            </pre>
          )}

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
