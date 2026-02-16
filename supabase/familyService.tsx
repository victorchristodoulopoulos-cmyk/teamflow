import { supabase } from "./supabaseClient";

export interface EnrollmentData {
  id: string;
  torneo_id: string;
  team_id: string;
  club_id: string;
  status: string;
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
  descuento?: number; // Añadido para que coincida con el Context
}

export interface PaymentData {
  id: string;
  torneo_id: string;
  concepto: string;
  importe: number;
  estado: string;
  fecha_vencimiento: string;
  created_at: string;
  paid_at?: string; // 🔥 VITAL para el historial
  stripe_status?: string; // 🔥 VITAL para saber si es SEPA
  metodo_pago?: string;
  metodo?: string;
}

export async function getChildFullContext(playerId: string) {
  // 1. Obtenemos inscripciones (Aseguramos traer club_id y clubs)
  const { data: enrollments, error: enrollError } = await supabase
    .from("torneo_jugadores")
    .select(`
      id, 
      torneo_id, 
      team_id, 
      club_id, 
      status,
      descuento,
      torneos (id, name, ciudad, fecha),
      clubs (id, name, logo_path)
    `)
    .eq("player_id", playerId);

  if (enrollError) {
    console.error("Error fetching enrollments:", enrollError);
  }

  // 2. Obtenemos pagos 🔥 AMPLIAMOS EL SELECT PARA TRAER TODO LO DE STRIPE
  const { data: payments, error: payError } = await supabase
    .from("pagos")
    .select("id, torneo_id, concepto, importe, estado, fecha_vencimiento, created_at, paid_at, stripe_status, metodo_pago, metodo")
    .eq("player_id", playerId);

  if (payError) {
    console.error("Error fetching payments:", payError);
  }

  // El club activo es el de su inscripción más reciente (o primera de la lista)
  const activeClub = enrollments && enrollments.length > 0 ? enrollments[0].clubs : null;

  return {
    enrollments: (enrollments || []) as EnrollmentData[],
    payments: (payments || []) as PaymentData[],
    club: activeClub 
  };
}