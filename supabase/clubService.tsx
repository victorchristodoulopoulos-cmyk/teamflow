import { supabase } from "./supabaseClient";

export type ClubContext = { club_id: string };

/**
 * Obtiene el contexto del club del usuario logueado
 */
export async function getMyClubContext(): Promise<ClubContext> {
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) throw new Error("No auth user");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("club_id, role")
    .eq("id", auth.user.id)
    .single();

  if (error) throw error;
  if (!profile?.club_id) throw new Error("Profile missing club_id");

  return { club_id: profile.club_id };
}

/**
 * Obtiene las estadísticas clave para el Dashboard del Club
 */
export async function getClubDashboardStats(clubId: string) {
  // Ejecutamos los conteos en paralelo para máxima eficiencia
  const [playersRes, teamsRes, tournamentsRes] = await Promise.all([
    supabase.from("jugadores").select("*", { count: "exact", head: true }).eq("club_id", clubId),
    supabase.from("equipos").select("*", { count: "exact", head: true }).eq("club_id", clubId),
    supabase.from("club_torneos").select("*", { count: "exact", head: true }).eq("club_id", clubId).eq("status", "activo")
  ]);

  return {
    players: playersRes.count || 0,
    teams: teamsRes.count || 0,
    tournaments: tournamentsRes.count || 0
  };
}

export type EquipoRow = {
  id: string;
  nombre: string;
  created_at: string;
  club_id: string;
  torneo_id: string | null;
};

/**
 * Obtiene todos los equipos de un club
 */
export async function getClubTeams(clubId: string) {
  const { data, error } = await supabase
    .from("equipos")
    .select("id, nombre, created_at, club_id, torneo_id")
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as EquipoRow[];
}

/**
 * Crea un nuevo equipo para el club
 */
export async function createTeam(input: { club_id: string; nombre: string; torneo_id?: string | null }) {
  const { data, error } = await supabase
    .from("equipos")
    .insert({
      club_id: input.club_id,
      nombre: input.nombre.trim(),
      torneo_id: input.torneo_id ?? null,
    })
    .select("id, nombre, created_at, club_id, torneo_id")
    .single();

  if (error) throw error;
  return data as EquipoRow;
}

export type JugadorRow = {
  id: string;
  name: string;
  surname: string | null;
  dni: string | null;
  birth_date: string | null;
  status: string | null;
  team_id: string | null;
  club_id: string;
};

/**
 * Obtiene todos los jugadores de un club
 */
export async function getClubPlayers(clubId: string) {
  const { data, error } = await supabase
    .from("jugadores")
    .select("id, name, surname, dni, birth_date, status, team_id, club_id")
    .eq("club_id", clubId)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as JugadorRow[];
}

/**
 * Crea un nuevo jugador vinculado al club
 */
export async function createPlayer(input: {
  club_id: string;
  team_id?: string | null;
  name: string;
  surname?: string | null;
  dni?: string | null;
  birth_date?: string | null;
  status?: string | null;
}) {
  const { data, error } = await supabase
    .from("jugadores")
    .insert({
      club_id: input.club_id,
      team_id: input.team_id ?? null,
      name: input.name.trim(),
      surname: (input.surname ?? "").trim() || null,
      dni: (input.dni ?? "").trim() || null,
      birth_date: input.birth_date ?? null,
      status: input.status ?? "pendiente",
    })
    .select("id, name, surname, dni, birth_date, status, team_id, club_id")
    .single();

  if (error) throw error;
  return data as JugadorRow;
}