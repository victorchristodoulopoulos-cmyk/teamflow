import { supabase } from "./supabaseClient";

export type TournamentConfig = {
  id: string;
  torneo_id: string;
  precio_total: number;
  moneda: string;
  status: string;
  configuracion_pagos?: { 
    plazos_permitidos: number[],
    tiene_matricula?: boolean,
    precio_matricula?: number 
  };
  torneos: {
    id: string;
    name: string;
    ciudad: string;
    fecha: string;
    estado: string;
  };
};

export async function getClubActiveTournaments(clubId: string) {
  if (!clubId) return [];
  const { data, error } = await supabase
    .from("club_torneos")
    .select(`id, torneo_id, precio_total, moneda, status, configuracion_pagos, torneos (id, name, ciudad, fecha, estado)`)
    .eq("club_id", clubId);
  if (error) { console.error("Error fetching tournaments:", error); return []; }
  return (data as any[]).filter(item => item.torneos !== null) as TournamentConfig[];
}

export async function registerClubToTournament(clubId: string, torneoId: string, precio: number) {
  const { data, error } = await supabase
    .from("club_torneos")
    .insert({ club_id: clubId, torneo_id: torneoId, precio_total: precio, status: 'activo' })
    .select().single();
  if (error) throw error;
  return data;
}

export async function getAvailableGlobalTournaments() {
  const { data, error } = await supabase.from("torneos").select("*").order("fecha", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getClubTournamentDetails(clubId: string, torneoId: string) {
  const { data, error } = await supabase
    .from("club_torneos")
    .select(`id, torneo_id, precio_total, moneda, status, configuracion_pagos, torneos (id, name, ciudad, fecha, estado)`)
    .eq("club_id", clubId)
    .eq("torneo_id", torneoId)
    .single();
  if (error) throw error;
  return data as unknown as TournamentConfig;
}

export async function getTournamentTeams(clubId: string, torneoId: string) {
  const { data, error } = await supabase
    .from("equipos")
    .select("id, name, club_id, torneo_id")
    .eq("club_id", clubId)
    .eq("torneo_id", torneoId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getPlayersByTeam(equipoId: string) {
  const { data, error } = await supabase
    .from("torneo_jugadores")
    .select(`id, player_id, status, jugadores (id, name, surname, dni, status)`)
    .eq("team_id", equipoId);
  if (error) throw error;
  return data;
}

export async function assignPlayerToTeam(equipoId: string, jugadorId: string, clubId: string, torneoId: string) {
  const { data: exists } = await supabase
    .from("torneo_jugadores")
    .select("id")
    .eq("team_id", equipoId)
    .eq("player_id", jugadorId)
    .maybeSingle();
  if (exists) return exists;
  const { data, error } = await supabase
    .from("torneo_jugadores")
    .insert({ team_id: equipoId, player_id: jugadorId, club_id: clubId, torneo_id: torneoId, status: 'inscrito' })
    .select().single();
  if (error) throw error;
  return data;
}

export async function getTeamStaff(equipoId: string) {
  const { data, error } = await supabase
    .from("team_users")
    .select(`id, profile_id, profiles (full_name, email)`)
    .eq("team_id", equipoId);
  if (error) throw error;
  return data; 
}

export async function getTeamPlayersWithFinance(equipoId: string, torneoId: string) {
  const { data: roster, error } = await supabase
    .from("torneo_jugadores")
    .select(`id, player_id, status, jugadores (id, name, surname, dni)`)
    .eq("team_id", equipoId);
  if (error) throw error;
  const playerIds = roster.map(r => r.player_id);
  if (playerIds.length === 0) return [];
  const { data: payments } = await supabase
    .from("pagos")
    .select("player_id, importe, estado")
    .eq("torneo_id", torneoId)
    .in("player_id", playerIds);
  return roster.map(item => {
    const playerPayments = payments?.filter(p => p.player_id === item.player_id) || [];
    const totalPaid = playerPayments
      .filter(p => p.estado === 'pagado')
      .reduce((acc, curr) => acc + curr.importe, 0);
    return { ...item, totalPaid };
  });
}

export async function getPendingEnrollmentsForFinance(playerId: string) {
  const { data: enrollments, error: enrollError } = await supabase
    .from('torneo_jugadores')
    .select(`id, torneo_id, team_id, player_id, club_id, torneos (name)`)
    .eq('player_id', playerId);
  if (enrollError || !enrollments || enrollments.length === 0) return [];
  const torneoIds = enrollments.map(e => e.torneo_id);
  const { data: existingPayments } = await supabase
    .from('pagos')
    .select('torneo_id')
    .eq('player_id', playerId)
    .in('torneo_id', torneoIds);
  const torneosConPagos = new Set(existingPayments?.map(p => p.torneo_id) || []);
  const pendingGenerations = enrollments.filter(e => !torneosConPagos.has(e.torneo_id));
  if (pendingGenerations.length === 0) return [];
  const results = [];
  for (const enroll of pendingGenerations) {
    const { data: config } = await supabase
      .from('club_torneos')
      .select('torneo_id, precio_total, configuracion_pagos')
      .eq('club_id', enroll.club_id)
      .eq('torneo_id', enroll.torneo_id)
      .maybeSingle();
    if (config) {
      const parsedConfig = typeof config.configuracion_pagos === 'string' ? JSON.parse(config.configuracion_pagos) : config.configuracion_pagos;
      results.push({
        ...enroll,
        precio_total: config.precio_total || 0,
        plazos_permitidos: parsedConfig?.plazos_permitidos || [1],
        tiene_matricula: parsedConfig?.tiene_matricula || false,
        precio_matricula: parsedConfig?.precio_matricula || 0
      });
    }
  }
  return results.filter(e => e.precio_total > 0); 
}

export async function generateInstallments(playerId: string, teamId: string, torneoId: string, precioTotal: number, plazos: number, torneoName: string, tieneMatricula: boolean, precioMatricula: number) {
  const { data: enroll } = await supabase.from('torneo_jugadores').select('club_id').eq('player_id', playerId).eq('torneo_id', torneoId).single();
  const insertData = [];
  const today = new Date();
  let restante = precioTotal;
  if (tieneMatricula && precioMatricula > 0) {
    restante = precioTotal - precioMatricula;
    insertData.push({ player_id: playerId, team_id: teamId || null, torneo_id: torneoId, club_id: enroll?.club_id, concepto: `Reserva / Matrícula - ${torneoName}`, importe: precioMatricula, estado: 'pendiente', fecha_vencimiento: today.toISOString().split('T')[0] });
  }
  if (restante > 0) {
    const baseCuota = Math.floor((restante / plazos) * 100) / 100;
    let acumulado = 0;
    for (let i = 0; i < plazos; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + (tieneMatricula ? i + 1 : i));
      const conceptoCuota = plazos === 1 && !tieneMatricula ? `Pago Único - ${torneoName}` : `Cuota ${i + 1}/${plazos} - ${torneoName}`;
      let importeActual = baseCuota;
      if (i === plazos - 1) { importeActual = parseFloat((restante - acumulado).toFixed(2)); }
      else { acumulado += baseCuota; }
      insertData.push({ player_id: playerId, team_id: teamId || null, torneo_id: torneoId, club_id: enroll?.club_id, concepto: conceptoCuota, importe: importeActual, estado: 'pendiente', fecha_vencimiento: dueDate.toISOString().split('T')[0] });
    }
  }
  const { error } = await supabase.from('pagos').insert(insertData);
  if (error) throw error;
  return true;
}

/**
 * 🛡️ MOTOR DE CASCADA FINANCIERA (NO ACUMULATIVO):
 * 1. Resetea los importes de los pagos pendientes al valor original del torneo.
 * 2. Aplica el nuevo valor de descuento total.
 */
export async function applyDiscountToPlayer(enrollmentId: string, playerId: string, torneoId: string, discountAmount: number) {
  // 1. Obtener precio base y configuración del club para ese torneo
  const { data: clubConfig } = await supabase
    .from('club_torneos')
    .select('precio_total, configuracion_pagos')
    .eq('torneo_id', torneoId)
    .single();

  if (!clubConfig) throw new Error("Configuración de torneo no encontrada");

  // 2. Traer todos los pagos del jugador para este torneo
  const { data: allPayments } = await supabase
    .from('pagos')
    .select('*')
    .eq('player_id', playerId)
    .eq('torneo_id', torneoId);

  if (!allPayments) return;

  // 3. Identificar cuántos plazos/cuotas (excluyendo matrícula) hay en total
  const cuotasPendientes = allPayments
    .filter(p => p.estado === 'pendiente' && !p.concepto.toLowerCase().includes('matrícula'));
  
  const matricula = allPayments.find(p => p.concepto.toLowerCase().includes('matrícula'));
  
  // 4. Calcular valor original de la cuota antes de cualquier descuento
  // Importante: El descuento NUNCA toca la matrícula, solo las cuotas.
  const precioMatricula = matricula ? matricula.importe : 0;
  const restanteOriginal = clubConfig.precio_total - precioMatricula;
  const numCuotasTotal = allPayments.filter(p => !p.concepto.toLowerCase().includes('matrícula')).length;
  
  const baseCuotaOriginal = Math.floor((restanteOriginal / numCuotasTotal) * 100) / 100;

  // 5. Aplicar el descuento en Cascada sobre los valores originales
  let remainingDiscount = discountAmount;
  
  // Ordenamos las cuotas pendientes por fecha descendente (empezar por la última)
  const sortedPendientes = [...cuotasPendientes].sort((a,b) => 
    new Date(b.fecha_vencimiento).getTime() - new Date(a.fecha_vencimiento).getTime()
  );

  for (let i = 0; i < sortedPendientes.length; i++) {
    const p = sortedPendientes[i];
    // Calculamos el valor original de esta cuota específica (ajuste de céntimos en la última)
    let originalValorCuota = baseCuotaOriginal;
    if (i === 0) { // Si es la última cronológicamente
        originalValorCuota = parseFloat((restanteOriginal - (baseCuotaOriginal * (numCuotasTotal - 1))).toFixed(2));
    }

    let nuevoImporte = originalValorCuota;

    if (remainingDiscount > 0) {
        if (originalValorCuota > remainingDiscount) {
            nuevoImporte = parseFloat((originalValorCuota - remainingDiscount).toFixed(2));
            remainingDiscount = 0;
        } else {
            remainingDiscount = parseFloat((remainingDiscount - originalValorCuota).toFixed(2));
            nuevoImporte = 0;
        }
    }

    await supabase.from('pagos').update({ importe: nuevoImporte }).eq('id', p.id);
  }

  // 6. Actualizar el valor del descuento en la ficha del jugador
  await supabase.from('torneo_jugadores').update({ descuento: discountAmount }).eq('id', enrollmentId);

  return true;
}