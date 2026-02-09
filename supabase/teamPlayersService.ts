import { supabase } from "./supabaseClient";

export type TeamPlayer = {
  id: string;
  name: string;
  surname: string | null;
  status: string | null;
  equipo_id: string;
};

export async function getPlayersForAssignedTeams(teamId: string): Promise<TeamPlayer[]> {
  const { data, error } = await supabase
    .from("torneo_jugadores")
    .select(
      `
      status,
      equipo_id,
      jugadores:player_id (
        id,
        name,
        surname
      )
    `
    )
    .eq("equipo_id", teamId);

  if (error) {
    console.error("getPlayersForAssignedTeams error:", error);
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.jugadores.id,
    name: row.jugadores.name,
    surname: row.jugadores.surname,
    status: row.status,
    equipo_id: row.equipo_id,
  }));
}
