import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

// ===========================
// 📌 TIPOS
// ===========================
export interface Player {
  id: string;
  name: string;
  surname: string;
  teamId: string;
  dni: string;
  birthDate: string;
  status: "Pendiente" | "Validado";
}

export interface Team {
  id: string;
  name: string;
}

export interface StoreContextType {
  players: Player[];
  teams: Team[];

  addPlayer: (p: Player) => void;
  updatePlayer: (p: Player) => void;
  deletePlayer: (id: string) => void;
}

// ===========================
// 📌 CONTEXTO
// ===========================
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// ===========================
// 📌 PROVIDER
// ===========================
export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams] = useState<Team[]>([
    // Puedes borrar estos si usas Supabase
    { id: "team1", name: "Equipo 1" },
    { id: "team2", name: "Equipo 2" },
  ]);

  // ➕ Crear
  const addPlayer = (p: Player) => {
    setPlayers((prev) => [...prev, { ...p, id: crypto.randomUUID() }]);
  };

  // ✏️ Editar
  const updatePlayer = (updated: Player) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  // 🗑️ Eliminar
  const deletePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        players,
        teams,
        addPlayer,
        updatePlayer,
        deletePlayer,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// ===========================
// 📌 HOOK useStore
// ===========================
export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
};
