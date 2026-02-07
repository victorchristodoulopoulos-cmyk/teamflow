import { supabase } from "./supabaseClient";

export interface FamilyPlayer {
  id: string;
  name: string;
  surname: string | null;
  dni: string | null;
  status: string | null;
}

export interface FamilyTeam {
  id: string;
  nombre: string;
}

export interface FamilyTournament {
  uuid: string;
  nombre: string;
  ciudad: string;
  fecha: string;
}

export interface FamilyDashboardData {
  player: FamilyPlayer | null;
  team: FamilyTeam | null;
  tournament: FamilyTournament | null;
}

export async function getFamilyDashboardData(
  playerId: string,
  teamId: string
): Promise<FamilyDashboardData> {
  /** 1️⃣ JUGADOR */
  const { data: player, error: playerErr } = await supabase
    .from("jugadores")
    .select("id, name, surname, dni, status")
    .eq("id", playerId)
    .single();

  if (playerErr) {
    console.error("❌ PLAYER ERROR", playerErr);
  }

  /** 2️⃣ EQUIPO + TORNEO (JOIN REAL) */
  const { data: team, error: teamErr } = await supabase
    .from("equipos")
    .select(`
      id,
      nombre,
      torneos (
        uuid,
        nombre,
        ciudad,
        fecha
      )
    `)
    .eq("id", teamId)
    .single();

  if (teamErr) {
    console.error("❌ TEAM ERROR", teamErr);
  }

  const tournament = Array.isArray(team?.torneos)
    ? team.torneos[0]
    : team?.torneos ?? null;

  return {
    player: player ?? null,
    team: team
      ? {
          id: team.id,
          nombre: team.nombre,
        }
      : null,
    tournament,
  };
}
