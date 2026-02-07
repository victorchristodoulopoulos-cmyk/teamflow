import { supabase } from "./supabaseClient";

export interface Tournament {
  uuid: string;
  nombre: string;
  ciudad: string;
  fecha: string;
}

export async function getTournamentByTeam(
  teamId: string
): Promise<Tournament | null> {
  const { data, error } = await supabase
    .from("equipos")
    .select(
      `
      torneos (
        uuid,
        nombre,
        ciudad,
        fecha
      )
    `
    )
    .eq("id", teamId)
    .single();

  if (error) {
    console.error("Error loading tournament:", error);
    return null;
  }

  // 🔥 SUPABASE DEVUELVE ARRAY
  const tournaments = data?.torneos;

  if (!tournaments || tournaments.length === 0) {
    return null;
  }

  return tournaments[0];
}
