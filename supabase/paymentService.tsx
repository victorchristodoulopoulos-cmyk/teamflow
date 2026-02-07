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
      fecha_vencimiento,
      fecha_pago,
      referencia
    `)
    .eq("player_id", playerId)
    .order("fecha_vencimiento", { ascending: true });

  if (error) {
    console.error("❌ Error loading payments:", error);
    throw error;
  }

  return data;
}
