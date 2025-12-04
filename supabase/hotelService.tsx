// supabase/hotelService.tsx
import { supabase } from "./supabaseClient";

export interface Hotel {
  id: string;
  name: string;
  city: string;
  stars: number;
  contact: string;
  rooms: number;
}

// Obtener todos los hoteles
export async function getHotels(): Promise<Hotel[]> {
  const { data, error } = await supabase.from("hoteles").select("*");
  if (error) throw error;

  return (data || []).map((h: any) => ({
    id: h.id,
    name: h.nombre,
    city: h.ciudad,
    stars: h.estrellas,
    contact: h.contacto,
    rooms: h.habitaciones_disponibles,
  }));
}

// Crear hotel
export async function createHotel(h: Omit<Hotel, "id">) {
  const { error } = await supabase.from("hoteles").insert({
    nombre: h.name,
    ciudad: h.city,
    estrellas: h.stars,
    contacto: h.contact,
    habitaciones_disponibles: h.rooms,
  });
  if (error) throw error;
}

// Actualizar hotel
export async function updateHotelDB(h: Hotel) {
  const { error } = await supabase
    .from("hoteles")
    .update({
      nombre: h.name,
      ciudad: h.city,
      estrellas: h.stars,
      contacto: h.contact,
      habitaciones_disponibles: h.rooms,
    })
    .eq("id", h.id);

  if (error) throw error;
}

// Borrar hotel
export async function deleteHotelDB(id: string) {
  const { error } = await supabase.from("hoteles").delete().eq("id", id);
  if (error) throw error;
}
