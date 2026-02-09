import { supabase } from "./supabaseClient";

export type Tournament = {
  id: string;
  nombre: string;
  ciudad: string | null;
  fecha: string | null;
};

export async function getTournamentsForTeam(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from("equipos")
    .select(`
      torneos (
        id,
        nombre,
        ciudad,
        fecha
      )
    `);

  if (error) throw error;

  const map = new Map<string, Tournament>();

  (data ?? []).forEach((row: any) => {
    if (row.torneos) {
      map.set(row.torneos.id, row.torneos);
    }
  });

  return Array.from(map.values());
}
