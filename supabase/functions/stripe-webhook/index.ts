// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No signature");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      httpClient: Stripe.createFetchHttpClient(),
    });
    
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
    const body = await req.text();

    // Validación asíncrona para evitar errores de SubtleCrypto
    const event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const pagoId = session.metadata?.pago_id;

      if (pagoId) {
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Actualización final cumpliendo con la restricción SQL
        const { error } = await supabaseAdmin
          .from("pagos")
          .update({
            estado: "pagado",
            paid_at: new Date().toISOString(), 
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            stripe_status: session.payment_status,
            metodo: "online" // <--- VALOR CORRECTO SEGÚN TU SQL
          })
          .eq("id", pagoId);

        if (error) {
          console.error("Error actualizando DB:", error.message);
          throw error;
        }
        console.log(`✅ ¡Éxito! Pago ${pagoId} marcado como online y pagado.`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    return new Response(`Error: ${err.message}`, { status: 400 });
  }
});