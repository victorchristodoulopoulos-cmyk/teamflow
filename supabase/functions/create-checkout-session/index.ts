import { serve, createClient, Stripe } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

    const { pago_id } = await req.json().catch(() => ({}));
    if (!pago_id) return json({ error: "Missing pago_id" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:5173";

    if (!supabaseUrl || !anonKey || !serviceRole || !stripeSecret) {
      return json({ error: "Missing env vars in Supabase secrets" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization header" }, 401);

    // Validate user token
    const supabaseUserClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabaseUserClient.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    // Service role client
    const supabase = createClient(supabaseUrl, serviceRole);

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("id, role, player_id")
      .eq("id", user.id)
      .single();

    if (profErr || !profile) return json({ error: "Profile not found" }, 404);
    if ((profile.role ?? "").toLowerCase() !== "family") return json({ error: "Only family can pay" }, 403);

    const { data: pago, error: pagoErr } = await supabase
      .from("pagos")
      .select("id, player_id, concepto, importe, estado")
      .eq("id", pago_id)
      .single();

    if (pagoErr || !pago) return json({ error: "Pago not found" }, 404);
    if (pago.player_id !== profile.player_id) return json({ error: "Forbidden: not your pago" }, 403);
    if ((pago.estado ?? "").toLowerCase() !== "pendiente") return json({ error: "Pago not payable" }, 400);

    const amountCents = Math.round(Number(pago.importe) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) return json({ error: "Invalid amount" }, 400);

    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

    const successUrl = `${appUrl}/#/family-dashboard/pagos?status=success&pago=${pago.id}`;
    const cancelUrl = `${appUrl}/#/family-dashboard/pagos?status=cancel&pago=${pago.id}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: { name: pago.concepto ?? "Pago TeamFlow" },
        },
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        pago_id: pago.id,
        player_id: pago.player_id,
        payer_user_id: user.id,
      },
    });

    await supabase
      .from("pagos")
      .update({
        stripe_checkout_session_id: session.id,
        stripe_status: session.status ?? "open",
      })
      .eq("id", pago.id);

    return json({ url: session.url }, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
