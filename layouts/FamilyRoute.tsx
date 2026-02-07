import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

export default function FamilyRoute({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        if (active) setState("denied");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!active) return;

      if (profile?.role === "family") setState("allowed");
      else setState("denied");
    };

    check();
    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") return null;
  if (state === "denied") return <Navigate to="/" replace />;

  return <>{children}</>;
}
