import { supabase } from "./supabaseClient";

export interface HotelEntry {
  id?: string;
  torneo_id: string;
  club_id: string;
  team_id?: string | null;
  name: string;
  address: string;
  ciudad: string;
  check_in: string;
  check_out: string;
  image_path?: string;
  google_maps_url?: string;
}

export interface TransportEntry {
  id?: string;
  torneo_id: string;
  club_id: string;
  team_id?: string | null;
  company: string;
  departure_city: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  meeting_point: string;
}

export const logisticsAdminService = {
  // --- GESTIÓN DE HOTELES ---
  async saveHotel(hotel: HotelEntry) {
    const { data, error } = await supabase
      .from("hoteles")
      .upsert(hotel)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteHotel(id: string) {
    const { error } = await supabase.from("hoteles").delete().eq("id", id);
    if (error) throw error;
  },

  // --- GESTIÓN DE TRANSPORTES ---
  async saveTransport(transport: TransportEntry) {
    const { data, error } = await supabase
      .from("transportes")
      .upsert(transport)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteTransport(id: string) {
    const { error } = await supabase.from("transportes").delete().eq("id", id);
    if (error) throw error;
  },

  // --- SELECTORES PARA EL FORMULARIO ---
  async getAdminMetadata() {
    const [torneos, clubs] = await Promise.all([
      supabase.from("torneos").select("id, name"),
      supabase.from("clubs").select("id, name")
    ]);
    return { torneos: torneos.data || [], clubs: clubs.data || [] };
  }
};