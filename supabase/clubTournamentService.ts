import { supabase } from "./supabaseClient";

export type TournamentConfig = {
  id: string;
  torneo_id: string;
  precio_total: number;
  moneda: string;
  status: string;
  torneos: {
    id: string;
    nombre: string;
    ciudad: string;
    fecha: string;
    estado: string;
  };
};

// --- LISTADOS GENERALES ---

export async function getClubActiveTournaments(clubId: string) {
  if (!clubId) return [];
  const { data, error } = await supabase
    .from("club_torneos")
    .select(`
      id, torneo_id, precio_total, moneda, status,
      torneos (id, nombre, ciudad, fecha, estado)
    `)
    .eq("club_id", clubId);

  if (error) { console.error("Error fetching tournaments:", error); return []; }
  return (data as any[]).filter(item => item.torneos !== null) as TournamentConfig[];
}

export async function registerClubToTournament(clubId: string, torneoId: string, precio: number) {
  const { data, error } = await supabase
    .from("club_torneos")
    .insert({ club_id: clubId, torneo_id: torneoId, precio_total: precio, status: 'activo' })
    .select().single();
  if (error) throw error;
  return data;
}

export async function getAvailableGlobalTournaments() {
  const { data, error } = await supabase.from("torneos").select("*").order("fecha", { ascending: true });
  if (error) throw error;
  return data;
}

// --- GESTIÓN DE TORNEO ESPECÍFICO (NUEVO) ---

/**
 * Obtiene la info completa de un torneo configurado por el club
 */
export async function getClubTournamentDetails(clubId: string, torneoId: string) {
  const { data, error } = await supabase
    .from("club_torneos")
    .select(`
      id, torneo_id, precio_total, moneda, status,
      torneos (id, nombre, ciudad, fecha, estado)
    `)
    .eq("club_id", clubId)
    .eq("torneo_id", torneoId)
    .single();

  if (error) throw error;
  return data as unknown as TournamentConfig;
}

/**
 * Obtiene SOLO los equipos creados para este torneo específico
 */
export async function getTournamentTeams(clubId: string, torneoId: string) {
  const { data, error } = await supabase
    .from("equipos")
    .select("id, nombre, club_id, torneo_id")
    .eq("club_id", clubId)
    .eq("torneo_id", torneoId)
    .order('nombre', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Obtiene los jugadores dentro de un equipo del torneo
 */
export async function getPlayersByTeam(equipoId: string) {
  const { data, error } = await supabase
    .from("torneo_jugadores")
    .select(`
      id, 
      player_id,
      status,
      jugadores (id, name, surname, dni, status)
    `)
    .eq("equipo_id", equipoId);

  if (error) throw error;
  return data;
}

/**
 * Asigna un jugador a un equipo (Convocatoria)
 */
export async function assignPlayerToTeam(equipoId: string, jugadorId: string) {
  // Verificamos si ya existe para evitar duplicados
  const { data: exists } = await supabase
    .from("torneo_jugadores")
    .select("id")
    .eq("equipo_id", equipoId)
    .eq("player_id", jugadorId)
    .maybeSingle();

  if (exists) return exists;

  const { data, error } = await supabase
    .from("torneo_jugadores")
    .insert({ equipo_id: equipoId, player_id: jugadorId, status: 'inscrito' })
    .select().single();

  if (error) throw error;
  return data;
}

/**
 * Obtiene el Staff (Entrenadores) asignados a un equipo
 */
export async function getTeamStaff(equipoId: string) {
  const { data, error } = await supabase
    .from("team_users")
    .select(`
      id,
      profile_id,
      profiles (full_name, email)
    `)
    .eq("team_id", equipoId);

  if (error) throw error;
  return data; // Devuelve array de entrenadores
}

/**
 * Obtiene jugadores DEL EQUIPO con sus PAGOS para este torneo
 */
export async function getTeamPlayersWithFinance(equipoId: string, torneoId: string) {
  // 1. Traemos los jugadores del equipo
  const { data: roster, error } = await supabase
    .from("torneo_jugadores")
    .select(`
      id, 
      player_id,
      status,
      jugadores (id, name, surname, dni)
    `)
    .eq("equipo_id", equipoId);

  if (error) throw error;

  // 2. Traemos los pagos de esos jugadores PARA ESTE TORNEO
  const playerIds = roster.map(r => r.player_id);
  
  if (playerIds.length === 0) return [];

  const { data: payments } = await supabase
    .from("pagos")
    .select("player_id, importe, estado")
    .eq("torneo_id", torneoId)
    .in("player_id", playerIds);

  // 3. Fusionamos la info (Jugador + sus Pagos)
  return roster.map(item => {
    const playerPayments = payments?.filter(p => p.player_id === item.player_id) || [];
    const totalPaid = playerPayments
      .filter(p => p.estado === 'pagado')
      .reduce((acc, curr) => acc + curr.importe, 0);
    
    return {
      ...item,
      totalPaid
    };
  });
}