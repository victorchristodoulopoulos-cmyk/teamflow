import { supabase } from "./supabaseClient";

export type Tournament = {
  id: string;
  nombre: string;
  ciudad: string | null;
  fecha: string | null;
  estado: string | null;
};

export async function getTournamentByTeam(teamId: string): Promise<Tournament | null> {
  // torneo_equipos -> torneos
  const { data, error } = await supabase
    .from("torneo_equipos")
    .select("torneos:torneo_id ( id, nombre, ciudad, fecha, estado )")
    .eq("equipo_id", teamId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.torneos as Tournament | null) ?? null;
}
