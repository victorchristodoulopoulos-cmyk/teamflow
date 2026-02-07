import { supabase } from "./supabaseClient";

export interface TeamOverviewData {
  torneo: {
    uuid: string;
    nombre: string;
    ciudad: string | null;
    fecha: string | null;
  } | null;
  equiposCount: number;
  jugadoresCount: number;
  docsValidatedPercent: number;
}

export async function getTeamOverview(teamId: string): Promise<TeamOverviewData> {
  // 1️⃣ Equipos del team
  const { data: equipos, error: equiposError } = await supabase
    .from("equipos")
    .select("id, torneo_id")
    .eq("id", teamId);

  if (equiposError) throw equiposError;

  const equiposCount = equipos?.length ?? 0;

  const torneoId = equipos?.[0]?.torneo_id ?? null;

  // 2️⃣ Torneo
  let torneo = null;

  if (torneoId) {
    const { data: torneoData } = await supabase
      .from("torneos")
      .select("uuid, nombre, ciudad, fecha")
      .eq("uuid", torneoId)
      .single();

    torneo = torneoData ?? null;
  }

  // 3️⃣ Jugadores
  const { data: jugadores } = await supabase
    .from("jugadores")
    .select("id, status")
    .eq("team_id", teamId);

  const jugadoresCount = jugadores?.length ?? 0;

  const validados = jugadores?.filter(j => j.status)?.length ?? 0;
  const docsValidatedPercent =
    jugadoresCount === 0 ? 0 : Math.round((validados / jugadoresCount) * 100);

  return {
    torneo,
    equiposCount,
    jugadoresCount,
    docsValidatedPercent,
  };
}
