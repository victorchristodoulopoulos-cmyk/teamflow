import { supabase } from "./supabaseClient";

export interface Player {
  id: string;
  name: string;
  team_id: string;
  birth_date: string | null;
  status: string | null;
  dni: string | null;
}

export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from("jugadores")
    .select("*")
    .eq("team_id", teamId);

  if (error) {
    console.error("❌ Error fetching players:", error);
    throw error;
  }

  return data ?? [];
}