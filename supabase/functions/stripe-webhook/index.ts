import { serve, createClient, Stripe } from "../_shared/deps.ts";

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceRole) {
      return new Response("Missing secrets", { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

    const sig = req.headers.get("stripe-signature");
    if (!sig) return new Response("Missing stripe-signature", { status: 400 });

    // IMPORTANT: raw body
    const body = await req.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (_err) {
      return new Response("Invalid signature", { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRole);

    // We care mainly about checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const pagoId = session?.metadata?.pago_id;
      const paymentIntent = session?.payment_intent;
      const status = session?.payment_status; // 'paid' usually

      if (pagoId) {
        await supabase
          .from("pagos")
          .update({
            estado: status === "paid" ? "pagado" : "pendiente",
            fecha_pago: status === "paid" ? new Date().toISOString() : null,
            stripe_payment_intent_id: paymentIntent ?? null,
            stripe_status: status ?? null,
          })
          .eq("id", pagoId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (_e) {
    return new Response("Server error", { status: 500 });
  }
});
