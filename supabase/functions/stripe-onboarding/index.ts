import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { club_id } = await req.json()
    if (!club_id) throw new Error('Falta el ID del club')

    // 1. Obtener los datos del club de la base de datos
    const { data: club, error: dbError } = await supabaseClient
      .from('clubs')
      .select('stripe_account_id, name')
      .eq('id', club_id)
      .single()

    if (dbError || !club) throw new Error('Club no encontrado en la base de datos')

    let accountId = club.stripe_account_id

    // 2. Si el club no tiene cuenta de Stripe, crearla (Tipo Express)
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'ES',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'company',
        settings: {
          payouts: {
            schedule: {
              interval: 'manual',
            },
          },
        },
      })
      accountId = account.id

      // Guardar el ID de la cuenta en nuestra tabla de clubs
      await supabaseClient
        .from('clubs')
        .update({ stripe_account_id: accountId })
        .eq('id', club_id)
    }

    // 3. Crear el enlace de onboarding (donde el usuario mete sus datos)
    const origin = req.headers.get('origin') || 'http://localhost:3000'
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/club-dashboard/pagos`,
      return_url: `${origin}/club-dashboard/pagos?onboarding=success`,
      type: 'account_onboarding',
    })

    return new Response(
      JSON.stringify({ url: accountLink.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})