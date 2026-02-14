// src/supabase/logisticsService.ts
import { supabase } from "./supabaseClient";

export async function getTeamLogistics(teamId: string, torneoId: string) {
  // Fetch Hotel
  const { data: hotelData, error: hotelError } = await supabase
    .from('hoteles')
    .select('*') // 👈 Trae TODAS las columnas de la tabla hoteles
    .eq('team_id', teamId) // 👈 Actualizado a team_id
    .eq('torneo_id', torneoId)
    .single(); // Asumimos un hotel principal por equipo y torneo

  // PGRST116 es el código de Supabase para "No se encontraron filas" (No es un error crítico si aún no tienen hotel)
  if (hotelError && hotelError.code !== 'PGRST116') {
      console.error("Error fetching hotel:", hotelError);
  }

  // Fetch Transport
  const { data: transportData, error: transportError } = await supabase
    .from('transportes')
    .select('*') // 👈 Trae TODAS las columnas de la tabla transportes
    .eq('team_id', teamId) // 👈 Actualizado a team_id
    .eq('torneo_id', torneoId)
    .single(); // Asumimos un transporte principal por equipo y torneo

   if (transportError && transportError.code !== 'PGRST116') {
      console.error("Error fetching transport:", transportError);
  }

  return {
    hotel: hotelData || null,
    transport: transportData || null
  };
}

export async function getClubTournamentLogistics(clubId: string, torneoId: string) {
  // Fetch Hotel de toda la expedición del club
  const { data: hotelData, error: hotelError } = await supabase
    .from('hoteles')
    .select('*')
    .eq('club_id', clubId) 
    .eq('torneo_id', torneoId)
    .single(); 

  if (hotelError && hotelError.code !== 'PGRST116') {
      console.error("Error fetching club hotel:", hotelError);
  }

  // Fetch Transport de toda la expedición del club
  const { data: transportData, error: transportError } = await supabase
    .from('transportes')
    .select('*')
    .eq('club_id', clubId)
    .eq('torneo_id', torneoId)
    .single(); 

   if (transportError && transportError.code !== 'PGRST116') {
      console.error("Error fetching club transport:", transportError);
  }

  return {
    hotel: hotelData || null,
    transport: transportData || null
  };
}

export async function getFamilyTournamentLogistics(playerId: string, torneoId: string) {
  // 1. Buscamos a qué equipo y club pertenece el niño en ese torneo
  const { data: enrollment } = await supabase
    .from('torneo_jugadores')
    .select('team_id, club_id')
    .eq('player_id', playerId)
    .eq('torneo_id', torneoId)
    .single();

  if (!enrollment) return { hotel: null, transport: null };

  // 2. Buscamos la logística (priorizamos por team_id si existe, si no por club_id)
  const { data: hotel } = await supabase
    .from('hoteles')
    .select('*')
    .eq('torneo_id', torneoId)
    .or(`team_id.eq.${enrollment.team_id},club_id.eq.${enrollment.club_id}`)
    .maybeSingle();

  const { data: transport } = await supabase
    .from('transportes')
    .select('*')
    .eq('torneo_id', torneoId)
    .or(`team_id.eq.${enrollment.team_id},club_id.eq.${enrollment.club_id}`)
    .maybeSingle();

  return { hotel, transport };
}