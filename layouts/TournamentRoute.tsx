import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function TournamentRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      // 🔥 MODO DIOS: Permitimos pasar a los Organizadores, a ti (Admin) y al SuperAdmin
      if (profile && (profile.role === "tournament" || profile.role === "admin" || profile.role === "super_admin")) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-deep flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
          <p className="text-amber-500 font-black uppercase tracking-[0.2em] text-xs animate-pulse">
            Verificando credenciales...
          </p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no tiene permiso, lo mandamos al login dorado
  if (!isAuthenticated || !isAuthorized) {
    return <Navigate to="/login/tournament" replace />;
  }

  return <>{children}</>;
}