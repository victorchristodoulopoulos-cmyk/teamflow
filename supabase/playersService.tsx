import { supabase } from "./supabaseClient";

export type Player = {
  id: string;
  name: string;
  surname: string | null;
  dni: string | null;
  status: string | null;
};

export async function getTeamPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("torneo_jugadores")
    .select(`
      id,
      jugadores (
        id,
        name,
        surname,
        dni
      ),
      status
    `)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.jugadores.id,
    name: row.jugadores.name,
    surname: row.jugadores.surname,
    dni: row.jugadores.dni,
    status: row.status,
  }));
}
