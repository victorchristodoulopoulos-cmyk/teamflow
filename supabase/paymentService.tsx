import { supabase } from "./supabaseClient";

export async function getFamilyPayments(playerId: string) {
  const { data, error } = await supabase
    .from("pagos")
    .select(`
      id,
      concepto,
      importe,
      estado,
      metodo,
      metodo_pago,
      fecha_vencimiento,
      fecha_pago,
      paid_at,
      referencia,
      created_at,
      torneo_id,
      club_id,
      stripe_status
    `)
    .eq("player_id", playerId)
    .order("fecha_vencimiento", { ascending: true });

  if (error) {
    console.error("❌ Error loading payments:", error);
    throw error;
  }

  return data;
}