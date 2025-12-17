import { supabase } from "./supabaseClient";

export interface TeamCategory {
  id: string;
  nombre: string;
}

export async function getTeamsByTournament(torneoId: string): Promise<TeamCategory[]> {
  const { data, error } = await supabase
    .from("equipos")
    .select("id, nombre")
    .eq("torneo_id", torneoId)
    .order("nombre");

  if (error) {
    console.error("❌ Error fetching teams:", error);
    throw error;
  }

  return data ?? [];
}
