import { supabase } from "./supabaseClient";

export type AssignedTeam = {
  id: string;
  nombre: string;
  torneo: {
    id: string;
    nombre: string;
    ciudad: string | null;
    fecha: string | null;
  } | null;
};

export async function getAssignedTeams(): Promise<AssignedTeam[]> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) console.error("auth.getUser error:", userErr);

  const user = userRes?.user;
  if (!user) return [];

  const profileId = user.id;

  // 1) Traer asignaciones (esto suele devolver vacío si RLS está mal)
  const { data: tuRows, error: tuErr } = await supabase
    .from("team_users")
    .select("team_id")
    .eq("profile_id", profileId);

  if (tuErr) {
    console.error("team_users select error:", tuErr);
    throw tuErr;
  }

  const teamIds = (tuRows ?? []).map((r: any) => r.team_id).filter(Boolean);
  if (!teamIds.length) return [];

  // 2) Traer equipos (si aquí sale vacío, RLS de equipos está mal)
  const { data: equiposRows, error: eqErr } = await supabase
    .from("equipos")
    .select(`
      id,
      nombre,
      torneos:torneo_id (
        id,
        nombre,
        ciudad,
        fecha
      )
    `)
    .in("id", teamIds);

  if (eqErr) {
    console.error("equipos select error:", eqErr);
    throw eqErr;
  }

  return (equiposRows ?? []).map((e: any) => ({
    id: e.id,
    nombre: e.nombre,
    torneo: e.torneos ?? null,
  }));
}
