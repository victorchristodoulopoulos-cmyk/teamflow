// supabase/functions/create-checkout-session/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // 1. Manejo de CORS (Pre-flight)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Inicializar Stripe y Supabase
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      httpClient: Stripe.createFetchHttpClient(),
    });
    
    // Cliente de Supabase para verificar al usuario que hace la petición
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // 3. Verificar Usuario Autenticado
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("No autorizado");

    // 4. Obtener el pago_id del cuerpo de la petición
    const { pago_id } = await req.json();
    if (!pago_id) throw new Error("Falta el ID del pago");

    // 5. Buscar los detalles del pago en la base de datos
    // Usamos el cliente del usuario para asegurar que solo pueda pagar lo que le corresponde
    const { data: pago, error: pagoError } = await supabaseClient
      .from("pagos")
      .select("*")
      .eq("id", pago_id)
      .single();

    if (pagoError || !pago) throw new Error("Pago no encontrado o sin acceso");
    if (pago.estado === 'pagado') throw new Error("Este recibo ya ha sido pagado");

    // 6. Crear la Sesión de Checkout en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: pago.concepto || "Cuota del Club",
              description: `Pago correspondiente al recibo #${pago.id.slice(0,8)}`,
            },
            unit_amount: Math.round(Number(pago.importe) * 100), // Stripe requiere céntimos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // URLs de retorno a tu aplicación local o producción
      success_url: `${req.headers.get("origin")}/family-dashboard/pagos?status=success`,
      cancel_url: `${req.headers.get("origin")}/family-dashboard/pagos?status=cancel`,
      // MUY IMPORTANTE: Pasamos el pago_id en la metadata para que el webhook lo reconozca
      metadata: {
        pago_id: pago.id,
        user_id: user.id
      },
    });

    console.log(`✅ Sesión de Stripe creada para el pago ${pago.id}: ${session.url}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error(`❌ Error creando sesión de Stripe: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});