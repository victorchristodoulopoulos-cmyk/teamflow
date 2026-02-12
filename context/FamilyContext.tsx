import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase/supabaseClient";
import { getChildFullContext, EnrollmentData, PaymentData } from "../supabase/familyService";

interface ChildCacheData {
  enrollments: EnrollmentData[];
  payments: PaymentData[];
  lastUpdated: number;
}

interface GlobalCache {
  [playerId: string]: ChildCacheData;
}

interface FamilyContextProps {
  players: any[];
  activeChildId: string | null;
  activeChild: any | null;
  changeActiveChild: (id: string) => void;
  loading: boolean;
  globalData: GlobalCache;
  refreshAllData: () => Promise<void>; 
  refreshProfile: () => Promise<void>; // <--- NUEVA FUNCIÓN CLAVE
}

const FamilyContext = createContext<FamilyContextProps | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<any[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [globalData, setGlobalData] = useState<GlobalCache>({});

  // Función para cargar datos profundos (Torneos/Pagos)
  const fetchDeepData = useCallback(async (childrenList: any[]) => {
    const newCache: GlobalCache = {};
    const promises = childrenList.map(async (child) => {
      try {
        const data = await getChildFullContext(child.id);
        newCache[child.id] = { 
          enrollments: data.enrollments, 
          payments: data.payments,
          lastUpdated: Date.now() 
        };
      } catch (err) {
        console.error(`Error cargando datos para ${child.name}`, err);
      }
    });
    await Promise.all(promises);
    setGlobalData(prev => ({ ...prev, ...newCache }));
  }, []);

  // Función PRINCIPAL para cargar la lista de hijos (Nombres, DNI, etc.)
  const loadFamilyData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Buscamos relaciones
    const { data: guardians } = await supabase
      .from("player_guardians")
      .select("player_id")
      .eq("family_profile_id", user.id);

    if (guardians && guardians.length > 0) {
      const ids = guardians.map(g => g.player_id);
      
      // 2. Buscamos los datos básicos (Aquí es donde se actualiza el nombre editado)
      const { data: playersData } = await supabase
        .from("jugadores")
        .select("*")
        .in("id", ids)
        .order('name', { ascending: true }); // Ordenamos para que no bailen

      if (playersData && playersData.length > 0) {
        setPlayers(playersData); // <--- AQUÍ SE ACTUALIZA LA UI
        
        // Gestionar ID activo
        const savedId = localStorage.getItem("activeChildId");
        if (!activeChildId) {
             const initialId = savedId && playersData.find(p => p.id === savedId) 
            ? savedId 
            : playersData[0].id;
            setActiveChildId(initialId);
        }
        
        // Cargar datos profundos en segundo plano
        fetchDeepData(playersData);
      }
    }
    setLoading(false);
  }, [fetchDeepData, activeChildId]);

  // Carga inicial al montar
  useEffect(() => {
    loadFamilyData();
  }, [loadFamilyData]);

  const changeActiveChild = (id: string) => {
    setActiveChildId(id);
    localStorage.setItem("activeChildId", id);
  };

  const activeChild = players.find(p => p.id === activeChildId) || null;

  return (
    <FamilyContext.Provider value={{ 
      players, 
      activeChild, 
      activeChildId, 
      changeActiveChild, 
      loading,
      globalData,
      refreshAllData: () => fetchDeepData(players),
      refreshProfile: loadFamilyData // <--- Exponemos la función de recarga
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