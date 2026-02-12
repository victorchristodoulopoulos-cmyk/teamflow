import { supabase } from "./supabaseClient";

// Definimos los tipos de retorno aquí mismo para evitar dependencias circulares
export interface EnrollmentData {
  id: string;
  equipo_id: string;
  equipos: {
    id: string;
    nombre: string;
    clubs: {
      id: string;
      name: string; // Ojo: name o nombre según tu DB
      logo_path: string | null;
    } | null;
  } | null;
  torneos: {
    id: string;
    nombre: string;
    ciudad: string | null;
    fecha: string | null;
    estado: string | null;
  } | null;
}

export interface PaymentData {
  id: string;
  importe: number;
  estado: string;
  concepto: string;
  fecha_vencimiento: string | null;
}

export async function getChildFullContext(playerId: string) {
  // 1. Obtenemos inscripciones
  const { data: enrollments, error: enrollError } = await supabase
    .from("torneo_jugadores")
    .select(`
      id,
      equipo_id,
      equipos (
        id, 
        nombre,
        clubs (
          id, 
          name, 
          logo_path
        )
      ),
      torneos (
        id,
        nombre,
        ciudad,
        fecha,
        estado
      )
    `)
    .eq("player_id", playerId);

  if (enrollError) {
    console.error("Error fetching enrollments:", enrollError);
    throw enrollError;
  }

  // 2. Obtenemos pagos
  const { data: payments, error: payError } = await supabase
    .from("pagos")
    .select("*")
    .eq("player_id", playerId);

  if (payError) {
    console.error("Error fetching payments:", payError);
    throw payError;
  }

  return {
    enrollments: (enrollments as unknown as EnrollmentData[]) || [],
    payments: (payments as unknown as PaymentData[]) || []
  };
}