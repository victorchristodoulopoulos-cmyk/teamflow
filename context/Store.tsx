// src/context/Store.tsx
import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";

// ===== Types =====
export type PlayerStatus = "Pendiente" | "Validado";

export interface Tournament {
  id: string;
  name: string;
  city: string;
  dates: string;
  status: "Planificado" | "En curso" | "Finalizado" | "Urgente";
}

export interface Team {
  id: string;
  name: string;
  tournamentId?: string | null;
}

export interface Player {
  id: string;
  name: string;
  surname: string;
  teamId: string;
  dni: string;
  birthDate: string;
  status: PlayerStatus;
}

export interface Hotel {
  id: string;
  name: string;
  city?: string;
}

export interface Transport {
  id: string;
  type: string;
  info?: string;
}

export interface Payment {
  id: string;
  teamId?: string;
  amount: number;
  status: "Pendiente" | "Pagado" | "Vencido";
}

export interface StoreContextType {
  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
  hotels: Hotel[];
  transport: Transport[];
  payments: Payment[];

  addPlayer: (p: Omit<Player, "id">) => void;
  updatePlayer: (p: Player) => void;
  deletePlayer: (id: string) => void;

  // (si luego quieres CRUD de teams/tournaments, lo añadimos)
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  // ⚠️ De momento estado local para que el dashboard funcione sin DB
  const [tournaments] = useState<Tournament[]>([]);
  const [teams] = useState<Team[]>([]);
  const [hotels] = useState<Hotel[]>([]);
  const [transport] = useState<Transport[]>([]);
  const [payments] = useState<Payment[]>([]);

  const [players, setPlayers] = useState<Player[]>([]);

  const addPlayer = (p: Omit<Player, "id">) => {
    const id = crypto.randomUUID();
    setPlayers((prev) => [...prev, { ...p, id }]);
  };

  const updatePlayer = (updated: Player) => {
    setPlayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deletePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const value = useMemo<StoreContextType>(
    () => ({
      tournaments,
      teams,
      players,
      hotels,
      transport,
      payments,
      addPlayer,
      updatePlayer,
      deletePlayer,
    }),
    [tournaments, teams, players, hotels, transport, payments]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
};
