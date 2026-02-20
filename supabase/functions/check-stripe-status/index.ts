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
    // 🔥 USAMOS EL SERVICE_ROLE_KEY PARA PODER EDITAR LA TABLA CLUBS SIN BLOQUEOS
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

    // 🔥 EL FIX: SI STRIPE DICE QUE ESTÁ LISTO, LO GUARDAMOS EN LA BASE DE DATOS
    if (isComplete) {
      await supabaseClient
        .from('clubs')
        .update({ stripe_onboarding_complete: true })
        .eq('id', club_id)
    }

    return new Response(
      JSON.stringify({ complete: isComplete }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  }
})