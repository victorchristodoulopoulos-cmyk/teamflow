import { supabase } from "./supabaseClient";

function getExt(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;
  const fromType = file.type.split("/").pop()?.toLowerCase();
  return fromType || "png";
}

/**
 * Sube el escudo al bucket club-logos dentro de {clubId}/...
 * Devuelve el path guardado.
 */
export async function uploadClubLogo(clubId: string, file: File) {
  const ext = getExt(file);
  const path = `${clubId}/logo-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("club-logos")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (error) throw error;
  return path;
}

export function getClubLogoPublicUrl(path: string) {
  const { data } = supabase.storage.from("club-logos").getPublicUrl(path);
  return data.publicUrl;
}

export async function updateClubLogoPath(clubId: string, logoPath: string) {
  const { error } = await supabase
    .from("clubs")
    .update({ logo_path: logoPath, logo_updated_at: new Date().toISOString() })
    .eq("id", clubId);

  if (error) throw error;
}

export async function fetchClub(clubId: string) {
  const { data, error } = await supabase
    .from("clubs")
    .select("id, name, logo_path, logo_updated_at")
    .eq("id", clubId)
    .single();

  if (error) throw error;
  return data;
}
