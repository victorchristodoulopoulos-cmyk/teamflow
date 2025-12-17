import { supabase } from "./supabaseClient";

export async function getTournamentByTeam(teamId: string) {
  const { data, error } = await supabase
    .from("equipos")
    .select(`
      torneos (
        uuid,
        nombre,
        ciudad,
        fecha
      )
    `)
    .eq("id", teamId)
    .single();

  if (error) {
    console.error("Error loading tournament:", error);
    return null;
  }

  return data?.torneos ?? null;
}
