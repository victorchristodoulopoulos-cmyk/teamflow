// supabase/teamsService.tsx
import { supabase } from "./supabaseClient";

// 👉 Tipo que usaremos en el frontend
export interface Team {
  id: string;
  name: string;
  created_at: string | null;
}

// 🔹 Obtener todos los equipos
export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("equipos")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.nombre,
    created_at: row.created_at ?? null,
  }));
}

// 🔹 Crear equipo
export async function createTeam(payload: { name: string }) {
  const { error } = await supabase.from("equipos").insert({
    nombre: payload.name,
  });

  if (error) throw error;
}

// 🔹 Actualizar equipo
export async function updateTeamDB(team: Team) {
  const { error } = await supabase
    .from("equipos")
    .update({
      nombre: team.name,
    })
    .eq("id", team.id);

  if (error) throw error;
}

// 🔹 Eliminar equipo
export async function deleteTeamDB(id: string) {
  const { error } = await supabase
    .from("equipos")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
