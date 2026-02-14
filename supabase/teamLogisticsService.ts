import { supabase } from "./supabaseClient";

export async function getTeamLogistics(teamId: string) {
  // 1. Obtener info del equipo y su torneo
  const { data: team, error: teamError } = await supabase
    .from("equipos")
    .select("torneo_id, nombre")
    .eq("id", teamId)
    .single();

  if (teamError || !team) throw new Error("Equipo no encontrado");

  // 2. Obtener Hotel vinculado al torneo
  // (Asumimos que el torneo tiene hoteles asignados en la tabla 'hoteles')
  const { data: hotel } = await supabase
    .from("hoteles")
    .select("*")
    .eq("torneo_id", team.torneo_id)
    .single(); // Si hay varios, aquí cogería el primero. Ajustar si la lógica es diferente.

  // 3. Obtener Transporte vinculado al equipo y torneo
  const { data: transport } = await supabase
    .from("transportes")
    .select("*")
    .eq("team_id", teamId) // Transporte específico de este equipo
    .eq("torneo_id", team.torneo_id)
    .single();

  return {
    hotel,
    transport
  };
}