import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Debug local
if (import.meta.env.DEV) {
  (window as any).supabase = supabase;
}
export const getPublicUrl = (path: string | null) => {
  if (!path) return null;
  // Si ya es una URL completa (http...), la devolvemos tal cual
  if (path.startsWith('http')) return path;
  
  // Si es un path de nuestro storage, generamos la URL pública
  // Asumimos que tu bucket se llama 'club-logos' (ajústalo si es otro)
  const { data } = supabase.storage.from('club-logos').getPublicUrl(path);
  return data.publicUrl;
};