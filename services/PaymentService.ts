import { supabase } from "../supabase/supabaseClient";

export type Pago = {
  id: string;
  concepto: string | null;
  importe: number | string;
  estado: string | null;
  fecha_vencimiento: string | null;
  fecha_pago: string | null;
};

export async function fetchMyPagos(): Promise<Pago[]> {
  // Ajusta aquí si tu tabla/columnas se llaman distinto
  const { data, error } = await supabase
    .from("pagos")
    .select("id, concepto, importe, estado, fecha_vencimiento, fecha_pago")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Pago[];
}

/**
 * Inicia el checkout de Stripe desde Edge Function.
 * IMPORTANTE: usa supabase.functions.invoke -> añade Authorization automáticamente.
 */
export async function startCheckoutForPago(pagoId: string) {
  const { data: session } = await supabase.auth.getSession();
  const accessToken = session.session?.access_token;
  if (!accessToken) throw new Error("No hay sesión activa");

  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { pagoId },
  });

  if (error) {
    // Esto te dará el error real de la function
    throw new Error(error.message);
  }

  const url = (data as any)?.url as string | undefined;
  if (!url) throw new Error("La función no devolvió URL de Stripe");

  window.location.href = url;
}
