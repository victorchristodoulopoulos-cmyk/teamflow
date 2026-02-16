import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

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

    // Buscamos el ID de Stripe del club
    const { data: club } = await supabaseClient
      .from('clubs')
      .select('stripe_account_id')
      .eq('id', club_id)
      .single()

    if (!club?.stripe_account_id) {
      return new Response(JSON.stringify({ complete: false }), { headers: corsHeaders })
    }

    // Consultamos a Stripe el estado real
    const account = await stripe.accounts.retrieve(club.stripe_account_id)
    
    // Verificamos si ha enviado los detalles y si puede recibir dinero
    const isComplete = account.details_submitted && account.charges_enabled

    return new Response(
      JSON.stringify({ complete: isComplete }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  }
})