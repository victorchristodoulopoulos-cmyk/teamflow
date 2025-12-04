// supabase/tournamentsservice.tsx
import { supabase } from "./supabaseClient";

// Obtener torneos
export async function getTournaments() {
  const { data, error } = await supabase.from("torneos").select("*");
  if (error) throw error;

  // Adaptar nombres de BD → FE
  return (data || []).map((t: any) => ({
    id: t.id,
    name: t.nombre,
    dates: t.fecha,
    city: t.ciudad,
    status: t.estado,
    hotelId: t.hotelId || "",
    transportId: t.transportId || "",
  }));
}

// Crear torneo
export async function createTournament(t: any) {
  const { error } = await supabase.from("torneos").insert({
    nombre: t.name,
    fecha: t.dates,
    ciudad: t.city,
    estado: t.status,
    hotelId: t.hotelId || "",
    transportId: t.transportId || "",
  });

  if (error) throw error;
}

// Actualizar torneo
export async function updateTournamentDB(t: any) {
  const { error } = await supabase
    .from("torneos")
    .update({
      nombre: t.name,
      fecha: t.dates,
      ciudad: t.city,
      estado: t.status,
      hotelId: t.hotelId || "",
      transportId: t.transportId || "",
    })
    .eq("id", t.id);

  if (error) throw error;
}

// Eliminar torneo
export async function deleteTournamentDB(id: string) {
  const { error } = await supabase.from("torneos").delete().eq("id", id);
  if (error) throw error;
}
