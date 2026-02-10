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
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) {
    console.log("[DBG3] getUser error:", authErr);
    return [];
  }
  const user = authData.user;
  if (!user) return [];

  // A) team_users
  const { data: tuRows, error: tuErr } = await supabase
    .from("team_users")
    .select("team_id")
    .eq("profile_id", user.id);

  console.log("[DBG3] team_users error:", tuErr);
  console.log("[DBG3] team_users rows:", tuRows);

  const teamIds = (tuRows ?? []).map((r: any) => r.team_id).filter(Boolean);
  console.log("[DBG3] teamIds:", teamIds);

  if (!teamIds.length) return [];

  const testId = teamIds[0];

const { data: e1, error: e1Err } = await supabase
  .from("equipos")
  .select("id, nombre, club_id, torneo_id")
  .eq("id", testId);

console.log("[DBG4] equipos eq(id) error:", e1Err);
console.log("[DBG4] equipos eq(id) data:", e1);


  // B) equipos + torneo
  const { data: equipos, error: eqErr } = await supabase
    .from("equipos")
    .select(`
      id,
      nombre,
      torneo_id,
      torneos:torneo_id (
        id,
        nombre,
        ciudad,
        fecha
      )
    `)
    .in("id", teamIds);

  console.log("[DBG3] equipos error:", eqErr);
  console.log("[DBG3] equipos rows:", equipos);

  if (eqErr) return [];

  return (equipos ?? []).map((e: any) => ({
    id: e.id,
    nombre: e.nombre,
    torneo: e.torneos ?? null,
  }));
}
