import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase/supabaseClient";
import { getChildFullContext, EnrollmentData, PaymentData } from "../supabase/familyService";

// Actualizamos la interfaz para que acepte el descuento y tipamos bien el club
interface ChildCacheData {
  enrollments: EnrollmentData[];
  payments: PaymentData[];
  // Cambiamos a Array o manejamos el objeto único para evitar el error ts(2739)
  club: { id: string, name: string, logo_path: string } | null;
  lastUpdated: number;
}

interface GlobalCache {
  [playerId: string]: ChildCacheData;
}

interface FamilyContextProps {
  players: any[];
  activeChildId: string | null;
  activeChild: any | null;
  changeActiveChild: (id: string | null) => void;
  setActiveChildId: (id: string | null) => void; // Añadido para compatibilidad con tus componentes
  loading: boolean;
  globalData: GlobalCache;
  reloadData: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextProps | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<any[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [globalData, setGlobalData] = useState<GlobalCache>({});

  const fetchDeepData = useCallback(async (childrenList: any[]) => {
    const newCache: GlobalCache = {};
    const promises = childrenList.map(async (child) => {
      try {
        // Esta función de servicio ya debe incluir 'descuento' en su select de torneo_jugadores
        const data = await getChildFullContext(child.id);
        
        // FIX: Si data.club viene como array (común en joins de Supabase), cogemos el primero
        const clubInfo = Array.isArray(data.club) ? data.club[0] : data.club;

        newCache[child.id] = { 
          enrollments: data.enrollments, 
          payments: data.payments,
          club: clubInfo || null,
          lastUpdated: Date.now() 
        };
      } catch (err) {
        console.error(`Error cargando datos profundos para ${child.name}`, err);
      }
    });
    await Promise.all(promises);
    setGlobalData(prev => ({ ...prev, ...newCache }));
  }, []);

  const loadFamilyData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: guardians } = await supabase
        .from("player_guardians")
        .select("player_id")
        .eq("family_profile_id", user.id);

      if (guardians && guardians.length > 0) {
        const ids = guardians.map(g => g.player_id);
        const { data: playersData } = await supabase
          .from("jugadores")
          .select("*")
          .in("id", ids)
          .order('name', { ascending: true });

        if (playersData && playersData.length > 0) {
          setPlayers(playersData);
          
          // Lógica de Selección Inteligente:
          const savedId = localStorage.getItem("activeChildId");
          const exists = playersData.find(p => p.id === savedId);

          if (exists) {
            setActiveChildId(savedId);
          } else {
            // Si no hay nada guardado o no existe, seleccionamos al primero por defecto
            setActiveChildId(playersData[0].id);
            localStorage.setItem("activeChildId", playersData[0].id);
          }
          
          await fetchDeepData(playersData);
        }
      }
    } catch (error) {
      console.error("Error en loadFamilyData:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchDeepData]);

  useEffect(() => {
    loadFamilyData();
  }, [loadFamilyData]);

  const changeActiveChild = (id: string | null) => {
    setActiveChildId(id);
    if (id) localStorage.setItem("activeChildId", id);
    else localStorage.removeItem("activeChildId");
  };

  const activeChild = players.find(p => p.id === activeChildId) || null;

  return (
    <FamilyContext.Provider value={{ 
      players, 
      activeChild, 
      activeChildId, 
      changeActiveChild,
      setActiveChildId: changeActiveChild, // Mapeamos ambas para evitar errores de referencia
      loading,
      globalData,
      reloadData: () => fetchDeepData(players),
      refreshProfile: loadFamilyData
    }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) throw new Error("useFamily must be used within FamilyProvider");
  return context;
};