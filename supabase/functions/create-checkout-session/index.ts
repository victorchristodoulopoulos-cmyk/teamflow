import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
// 🔥 EL FIX MÁGICO: Importación nativa de NPM
import Stripe from "npm:stripe@14.14.0"; 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 🔥 FIX: Instanciación limpia sin httpClient raro
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { pago_id } = await req.json();
    if (!pago_id) throw new Error("Falta el ID del pago");

    const { data: pago, error: pagoError } = await supabaseAdmin
      .from("pagos")
      .select("*, clubs(stripe_account_id, name)")
      .eq("id", pago_id)
      .single();

    if (pagoError || !pago) throw new Error("Pago no encontrado");
    
    const destinationAccountId = pago.clubs?.stripe_account_id;
    if (!destinationAccountId) throw new Error("El club no tiene cuenta de cobros vinculada");

    const FEE_TEAMFLOW = 200; // 2.00€

    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: pago.concepto || "Cuota del Club",
            description: `Club: ${pago.clubs?.name}`,
          },
          unit_amount: Math.round(Number(pago.importe) * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      
      payment_intent_data: {
        application_fee_amount: FEE_TEAMFLOW,
        transfer_data: {
          destination: destinationAccountId,
        },
        metadata: {
          pago_id: pago.id,
          club_id: pago.club_id
        }
      },

      metadata: {
        pago_id: pago.id,
        club_id: pago.club_id
      },
      
      success_url: `${req.headers.get("origin")}/family-dashboard/pagos?status=success`,
      cancel_url: `${req.headers.get("origin")}/family-dashboard/pagos?status=cancel`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("LOG ERROR:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});