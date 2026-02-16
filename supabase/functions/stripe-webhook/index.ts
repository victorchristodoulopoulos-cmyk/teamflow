import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
// 🔥 Importación nativa para que Deno vuele sin errores
import Stripe from "npm:stripe@14.14.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Firma de Stripe no encontrada");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
    const body = await req.text();

    const event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log(`🔔 EVENTO RECIBIDO: ${event.type}`);

    // 🟡 EVENTOS 1 y 2: checkout.session.completed Y checkout.session.async_payment_succeeded
    // El padre ha firmado la orden (Con tarjeta o con SEPA)
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as any;
      const pagoId = session.metadata?.pago_id; 

      if (pagoId) {
        // Si es tarjeta pone "paid" (pagado). Si es SEPA pone "unpaid" (procesando).
        const esPagoConfirmado = session.payment_status === "paid";
        const nuevoEstado = esPagoConfirmado ? "pagado" : "procesando";

        const { error } = await supabaseAdmin.from("pagos").update({
          estado: nuevoEstado,
          stripe_status: session.payment_status,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent,
          paid_at: esPagoConfirmado ? new Date().toISOString() : null,
          metodo_pago: "Stripe"
        }).eq("id", pagoId);
        
        if (error) throw error;
        console.log(`✅ Fase 1 completada. Recibo: ${pagoId} -> ${nuevoEstado}`);
      }
    }

    // 🟢 EVENTO 3: payment_intent.succeeded
    // El furgón blindado llega con la pasta (Aquí sacamos tu comisión)
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as any;
      const pagoId = pi.metadata?.pago_id;
      
      if (pagoId) {
        let comisionTotal = 0;
        try {
          const piExpanded = await stripe.paymentIntents.retrieve(pi.id, {
            expand: ['latest_charge.balance_transaction']
          });
          const charge = piExpanded.latest_charge as any;
          if (charge && charge.balance_transaction) {
            comisionTotal = charge.balance_transaction.fee / 100; // Pasamos céntimos a Euros
          }
        } catch (feeError) {
          console.log("⚠️ Info: No se extrajo comisión extra, omitiendo...");
        }

        await supabaseAdmin.from("pagos").update({
          estado: "pagado",
          stripe_status: "succeeded",
          paid_at: new Date().toISOString(),
          comision: comisionTotal
        }).eq("id", pagoId);
        
        console.log(`💰 ¡DINERO RECIBIDO! Recibo ${pagoId} PAGADO. Comisión: ${comisionTotal}€`);
      }
    }

    // 🔴 EVENTO 4: payment_intent.payment_failed
    // El banco del padre rechaza el pago por falta de fondos
    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as any;
      const pagoId = pi.metadata?.pago_id;
      if (pagoId) {
        await supabaseAdmin.from("pagos").update({
          estado: "pendiente",
          stripe_status: "failed"
        }).eq("id", pagoId);
        console.log(`❌ ¡PAGO FALLIDO! Recibo ${pagoId} vuelve a pendiente.`);
      }
    }

    // 🏦 EVENTO 5: payout.paid
    // Stripe ingresa el dinero físico en la cuenta del banco del Club
    if (event.type === "payout.paid") {
      const payout = event.data.object as any;
      const stripeAccountId = event.account; // ID del club destino
      console.log(`🏦 ¡TRANSFERENCIA AL CLUB REALIZADA! Monto: ${payout.amount / 100}€ enviados al destino ${stripeAccountId}`);
      // Aquí en el futuro meteremos el envío del email automático al club.
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error(`⚠️ Webhook Error Crítico: ${err.message}`);
    return new Response(`Error: ${err.message}`, { status: 400 });
  }
});