import { supabase } from "./supabaseClient";

export type ClubContext = { club_id: string };

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

export async function getClubDashboardStats(clubId: string) {
  const [playersRes, teamsRes, tournamentsRes] = await Promise.all([
    supabase.from("torneo_jugadores").select("*", { count: "exact", head: true }).eq("club_id", clubId),
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
  name: string;
  created_at: string;
  club_id: string;
  torneo_id: string | null;
  torneos?: { name: string }; // 🛡️ NUEVO: Para saber de qué torneo es
};

/**
 * Obtiene todos los equipos de un club (AHORA CON SU TORNEO ASIGNADO)
 */
export async function getClubTeams(clubId: string) {
  const { data, error } = await supabase
    .from("equipos")
    .select("id, name, created_at, club_id, torneo_id, torneos(name)")
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as EquipoRow[];
}

export async function createTeam(input: { club_id: string; name: string; torneo_id?: string | null }) {
  const { data, error } = await supabase
    .from("equipos")
    .insert({
      club_id: input.club_id,
      name: input.name.trim(),
      torneo_id: input.torneo_id ?? null,
    })
    .select("id, name, created_at, club_id, torneo_id")
    .single();

  if (error) throw error;
  return data as EquipoRow;
}

export type JugadorRow = {
  enrollment_id: string;
  player_id: string;
  name: string;
  surname: string | null;
  dni: string | null;
  birth_date: string | null;
  status: string | null;
  team_id: string | null;
  team_name: string;
  tournament_name: string;
};

export async function getClubPlayers(clubId: string) {
  const { data, error } = await supabase
    .from("torneo_jugadores")
    .select(`
      id,
      player_id,
      team_id,
      status,
      jugadores (id, name, surname, dni, birth_date, status),
      equipos (name),
      torneos (name)
    `)
    .eq("club_id", clubId);

  if (error) throw error;
  
  return (data ?? [])
    .filter((row: any) => row.jugadores !== null)
    .map((row: any) => ({
      enrollment_id: row.id,
      player_id: row.player_id,
      name: row.jugadores.name,
      surname: row.jugadores.surname,
      dni: row.jugadores.dni,
      birth_date: row.jugadores.birth_date,
      status: row.status,
      team_id: row.team_id,
      team_name: row.equipos?.name || "Sin Equipo Asignado",
      tournament_name: row.torneos?.name || "Torneo Desconocido"
    })) as JugadorRow[];
}

export async function createPlayerAndEnroll(input: {
  club_id: string;
  torneo_id: string;
  team_id: string;
  name: string;
  surname?: string | null;
  dni?: string | null;
  birth_date?: string | null;
}) {
  const { data: player, error: pErr } = await supabase
    .from("jugadores")
    .insert({
      name: input.name.trim(),
      surname: (input.surname ?? "").trim() || null,
      dni: (input.dni ?? "").trim() || null,
      birth_date: input.birth_date ?? null,
      status: "activo",
    })
    .select()
    .single();

  if (pErr) throw pErr;

  const { error: eErr } = await supabase
    .from("torneo_jugadores")
    .insert({
      player_id: player.id,
      club_id: input.club_id,
      torneo_id: input.torneo_id,
      team_id: input.team_id,
      status: 'inscrito'
    });

  if (eErr) throw eErr;
  return player;
}

export async function updatePlayerDetails(playerId: string, data: { name: string; surname: string | null; dni: string | null; birth_date: string | null }) {
  const { error } = await supabase
    .from('jugadores')
    .update({
      name: data.name.trim(),
      surname: data.surname?.trim() || null,
      dni: data.dni?.trim() || null,
      birth_date: data.birth_date || null
    })
    .eq('id', playerId);

  if (error) throw error;
}

export async function updateEnrollmentTeam(enrollmentId: string, teamId: string | null) {
  const { error } = await supabase
    .from('torneo_jugadores')
    .update({ team_id: teamId })
    .eq('id', enrollmentId);

  if (error) throw error;
}

export async function getTeamRosterWithFinances(teamId: string) {
  const { data: roster, error } = await supabase
    .from("torneo_jugadores")
    .select(`
      id, player_id, status, torneo_id,
      jugadores (id, name, surname, dni)
    `)
    .eq("team_id", teamId);

  if (error) throw error;
  if (!roster || roster.length === 0) return [];

  const playerIds = roster.map(r => r.player_id);
  const { data: payments } = await supabase
    .from("pagos")
    .select("player_id, importe, estado")
    .eq("team_id", teamId)
    .in("player_id", playerIds);

  return roster.map((item: any) => {
    const playerPayments = payments?.filter(p => p.player_id === item.player_id) || [];
    
    const totalPending = playerPayments
      .filter(p => p.estado === 'pendiente')
      .reduce((acc, curr) => acc + curr.importe, 0);

    const totalPaid = playerPayments
      .filter(p => p.estado === 'pagado')
      .reduce((acc, curr) => acc + curr.importe, 0);
    
    return {
      player_id: item.player_id,
      name: item.jugadores.name,
      surname: item.jugadores.surname,
      dni: item.jugadores.dni,
      status: item.status,
      totalPending,
      totalPaid,
      isUpToDate: totalPending === 0
    };
  });
}