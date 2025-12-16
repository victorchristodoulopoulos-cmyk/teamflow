import React, { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ======================================================
      // 🔐 LOGIN
      // ======================================================
      if (mode === "login") {
        console.log("🔑 LOGIN intent:", { email, password });

        // 1) LOGIN DE EQUIPO (primero)
        const {
          data: teamUser,
          error: teamError,
        } = await supabase
          .from("team_users")
          .select("*")
          .eq("email", email)
          .eq("password", password)
          .maybeSingle();

        console.log("👀 Resultado team_users:", { teamUser, teamError });

        if (teamError) {
          console.error("❌ Error al consultar team_users:", teamError);
        }

        if (teamUser) {
          console.log("✅ Login de equipo OK, guardando en localStorage");
          localStorage.setItem("team_user", JSON.stringify(teamUser));
          navigate("/team-dashboard"); // ruta del router
          return; // MUY IMPORTANTE
        }

        // 2) LOGIN DE ADMIN (Supabase Auth)
        const { error: adminError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log("👀 Resultado login admin:", { adminError });

        if (!adminError) {
          navigate("/dashboard");
          return;
        }

        throw new Error("Credenciales incorrectas");
      }

      // ======================================================
      // 🆕 SIGNUP — SOLO ADMINS
      // ======================================================
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: email,
            role: "admin",
          });
        }

        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("🔥 Error en handleSubmit:", err);
      setError(err.message ?? "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-deep">
      <div className="bg-brand-surface border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-display font-bold text-white mb-4">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-4 py-2 bg-brand-neon text-brand-deep font-bold rounded-lg hover:bg-white disabled:opacity-50"
          >
            {loading
              ? "Procesando..."
              : mode === "login"
              ? "Entrar"
              : "Crear cuenta"}
          </button>
        </form>

        <button
          className="mt-4 text-sm text-slate-400 hover:text-white"
          onClick={() =>
            setMode((m) => (m === "login" ? "signup" : "login"))
          }
        >
          {mode === "login"
            ? "¿No tienes cuenta? Crear una"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
};

export default Login;
