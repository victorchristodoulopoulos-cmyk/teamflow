import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@14.14.0"; 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    const { pago_id } = await req.json();
    if (!pago_id) throw new Error("Falta el ID del pago");

    // 🔥 1. OBTENEMOS EL EMAIL REAL DEL PADRE LOGUEADO
    // Leemos el token de autorización que envía React
    const authHeader = req.headers.get('Authorization');
    let userEmail = "familia@teamflow.app"; // Fallback de seguridad por si algo falla
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      // Le pedimos a Supabase los datos de ese usuario
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user?.email) {
        userEmail = user.email; // ¡Asignamos su email real!
      }
    }

    // 2. Leemos los datos del pago y del club
    const { data: pago, error: pagoError } = await supabaseAdmin
      .from("pagos")
      .select("*, clubs(stripe_account_id, name, admite_tarjeta, admite_transferencia)")
      .eq("id", pago_id)
      .single();

    if (pagoError || !pago) throw new Error("Pago no encontrado");
    
    const destinationAccountId = pago.clubs?.stripe_account_id;
    if (!destinationAccountId) throw new Error("El club no tiene cuenta de cobros vinculada");

    // Extraemos la configuración (Por defecto es true si no hay nada guardado)
    const admiteTarjeta = pago.clubs?.admite_tarjeta !== false;
    const admiteTransferencia = pago.clubs?.admite_transferencia !== false;

    // 3. Creamos el cliente en Stripe CON SU EMAIL REAL
    const customer = await stripe.customers.create({
      name: `Familia (Pago: ${pago.concepto})`,
      email: userEmail, // 👈 ¡La magia ocurre aquí!
      metadata: { pago_id: pago.id }
    });

    const FEE_TEAMFLOW = 200; // Tu comisión

    // 4. Opciones de pago dinámicas
    const paymentMethods = [];
    const paymentMethodOptions: any = {};

    if (admiteTarjeta) {
      paymentMethods.push("card");
    }

    if (admiteTransferencia) {
      paymentMethods.push("customer_balance"); 
      paymentMethodOptions.customer_balance = {
        funding_type: "bank_transfer",
        bank_transfer: { 
          type: "eu_bank_transfer",
          eu_bank_transfer: { country: "DE" } // IBAN de Alemania
        }
      };
    }

    // Anti-bloqueos: Si el club apagó todo, forzamos tarjeta para que el sistema no pete
    if (paymentMethods.length === 0) paymentMethods.push("card");

    // 5. Creamos la sesión de pago
    const sessionConfig: any = {
      customer: customer.id,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: pago.concepto || "Cuota del Club", description: `Club: ${pago.clubs?.name}` },
          unit_amount: Math.round(Number(pago.importe) * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      payment_method_types: paymentMethods,
      payment_intent_data: {
        application_fee_amount: FEE_TEAMFLOW,
        transfer_data: { destination: destinationAccountId },
        metadata: { pago_id: pago.id, club_id: pago.club_id }
      },
      metadata: { pago_id: pago.id, club_id: pago.club_id },
      success_url: `${req.headers.get("origin")}/family-dashboard/pagos?status=success`,
      cancel_url: `${req.headers.get("origin")}/family-dashboard/pagos?status=cancel`,
    };

    if (admiteTransferencia) {
        sessionConfig.payment_method_options = paymentMethodOptions;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });

  } catch (error: any) {
    console.error("🔥 ERROR STRIPE:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, 
    });
  }
});