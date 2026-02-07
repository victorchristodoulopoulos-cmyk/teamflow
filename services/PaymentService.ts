import { supabase } from "../supabase/supabaseClient";

export type Pago = {
  id: string;
  player_id: string;
  team_id?: string | null;
  concepto?: string | null;
  importe: number;
  estado?: string | null;
  fecha_vencimiento?: string | null;
  fecha_pago?: string | null;
};

export async function fetchMyPagos(): Promise<Pago[]> {
  const { data, error } = await supabase
    .from("pagos")
    .select("id, player_id, team_id, concepto, importe, estado, fecha_vencimiento, fecha_pago")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Pago[];
}

export async function startCheckoutForPago(pagoId: string) {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("No session token");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const endpoint = `${supabaseUrl}/functions/v1/create-checkout-session`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pago_id: pagoId }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? "Error creando checkout");

  const url = json?.url as string | undefined;
  if (!url) throw new Error("No checkout url");

  window.location.href = url;
}
