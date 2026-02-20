import { supabase } from "./supabaseClient";

export interface EnrollmentData {
  id: string;
  torneo_id: string;
  team_id: string;
  club_id: string;
  status: string;
  descuento?: number;
  torneos: { 
    id: string; 
    name: string; 
    ciudad: string; 
    fecha: string; 
  };
  clubs: {      
    id: string;
    name: string;
    logo_path: string;
  } | null;
}

export interface PaymentData {
  id: string;
  torneo_id: string;
  concepto: string;
  importe: number;
  estado: string;
  fecha_vencimiento: string;
  created_at: string;
  paid_at?: string;
  stripe_status?: string;
  metodo_pago?: string;
}

export async function getChildFullContext(playerId: string) {
  const { data: enrollments, error: enrollError } = await supabase
    .from("torneo_jugadores")
    .select(`
      id, torneo_id, team_id, club_id, status, descuento,
      torneos (id, name, ciudad, fecha),
      clubs (id, name, logo_path)
    `)
    .eq("player_id", playerId);

  if (enrollError) console.error("Error enrollments:", enrollError);

  const { data: payments, error: payError } = await supabase
    .from("pagos")
    .select("id, torneo_id, concepto, importe, estado, fecha_vencimiento, created_at, paid_at, stripe_status, metodo_pago")
    .eq("player_id", playerId);

  if (payError) console.error("Error payments:", payError);

  // 🔥 Fix tipado: Supabase a veces devuelve objetos dentro de arrays en los joins
  const formattedEnrollments = (enrollments || []).map((e: any) => ({
    ...e,
    torneos: Array.isArray(e.torneos) ? e.torneos[0] : e.torneos,
    clubs: Array.isArray(e.clubs) ? e.clubs[0] : e.clubs
  })) as EnrollmentData[];

  const activeClub = formattedEnrollments.length > 0 ? formattedEnrollments[0].clubs : null;

  return {
    enrollments: formattedEnrollments,
    payments: (payments || []) as PaymentData[],
    club: activeClub 
  };
}

export async function getClubStagesForFamily(clubId: string, playerId: string) {
  const { data: stages, error } = await supabase
    .from("stages")
    .select("*, clubs(name, logo_path)")
    .eq("club_id", clubId)
    .order("fecha_inicio", { ascending: true });

  if (error) throw error;

  const { data: inscripciones } = await supabase
    .from("stage_inscripciones")
    .select("stage_id")
    .eq("player_id", playerId);

  const inscritosIds = new Set(inscripciones?.map(i => i.stage_id));

  return (stages || []).map(s => ({
    ...s,
    clubs: Array.isArray(s.clubs) ? s.clubs[0] : s.clubs,
    estaInscrito: inscritosIds.has(s.id)
  }));
}

export async function enrollPlayerInStage(playerId: string, stageId: string, clubId: string) {
  const { data, error } = await supabase
    .from("stage_inscripciones")
    .insert({ player_id: playerId, stage_id: stageId, club_id: clubId, estado: 'inscrito' })
    .select().single();
  if (error) throw error;
  return data;
}