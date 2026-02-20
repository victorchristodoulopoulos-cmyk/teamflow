import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';

// Definimos qué datos va a tener nuestra "Nube"
interface TournamentContextType {
  torneoId: string | null;
  torneoData: any | null;
  inscripciones: any[];
  categoriasOficiales: any[];
  sedes: any[];
  loading: boolean;
  refreshData: () => Promise<void>; // Para forzar recarga si queremos
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [torneoId, setTorneoId] = useState<string | null>(null);
  const [torneoData, setTorneoData] = useState<any>(null);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [categoriasOficiales, setCategoriasOficiales] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Esta función carga TODO de golpe
  const fetchAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Buscamos el ID del torneo del usuario
      const { data: profile } = await supabase.from("profiles").select("torneo_id").eq("id", user.id).single();
      
      if (profile?.torneo_id) {
        setTorneoId(profile.torneo_id);

        // 🔥 LANZAMOS TODAS LAS PETICIONES EN PARALELO (Mucho más rápido)
        const [resTorneo, resInscripciones, resCategorias, resSedes] = await Promise.all([
          supabase.from("torneos").select("*").eq("id", profile.torneo_id).single(),
          supabase.from("inscripciones_torneo").select("*").eq("torneo_id", profile.torneo_id),
          supabase.from("categorias_torneo").select("*").eq("torneo_id", profile.torneo_id).order("nombre"),
          supabase.from("sedes_torneo").select("*").eq("id, nombre").eq("torneo_id", profile.torneo_id)
        ]);

        if (resTorneo.data) setTorneoData(resTorneo.data);
        if (resInscripciones.data) setInscripciones(resInscripciones.data);
        if (resCategorias.data) setCategoriasOficiales(resCategorias.data);
        if (resSedes.data) setSedes(resSedes.data);
      }
    } catch (error) {
      console.error("Error cargando el contexto del torneo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <TournamentContext.Provider value={{ 
      torneoId, 
      torneoData, 
      inscripciones, 
      categoriasOficiales, 
      sedes, 
      loading,
      refreshData: fetchAllData 
    }}>
      {children}
    </TournamentContext.Provider>
  );
}

// Hook personalizado para usarlo fácil en las páginas
export function useTournament() {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament debe usarse dentro de un TournamentProvider');
  }
  return context;
}