import { supabase } from "./supabaseClient";

export type TeamPlayer = {
  id: string;
  name: string;
  surname: string | null;
  status: string | null;
  team_id: string;
  actual_team: string | null; // <--- NUEVO
  position: string | null;    // <--- NUEVO
};

export async function getPlayersForAssignedTeams(teamId: string): Promise<TeamPlayer[]> {
  const { data, error } = await supabase
    .from("torneo_jugadores")
    .select(
      `
      status,
      team_id,
      jugadores:player_id (
        id,
        name,
        surname,
        actual_team,
        position
      )
    `
    )
    .eq("team_id", teamId);

  if (error) {
    console.error("getPlayersForAssignedTeams error:", error);
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.jugadores.id,
    name: row.jugadores.name,
    surname: row.jugadores.surname,
    status: row.status,
    team_id: row.team_id,
    actual_team: row.jugadores.actual_team, // <--- NUEVO
    position: row.jugadores.position,       // <--- NUEVO
  }));
}