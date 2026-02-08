import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";

// ===== Types =====
export type PlayerStatus = "Pendiente" | "Validado";

export interface Tournament {
  id: string;
  name: string;
  city: string;
  dates: string;
  status: "Planificado" | "En curso" | "Finalizado" | "Urgente";
  // Possibly also hotelId, transportId if needed
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
  // Other fields like stars, contact, rooms are not stored in context (admin uses supabase directly)
}

export interface Transport {
  id: string;
  type: string;            // e.g., "Bus", "Avión"
  company: string;
  seats: number;
  departureTime: string;
  departureCity: string;
  status: string;          // e.g., "Pendiente" or "OK"
}

export interface Payment {
  id: string;
  teamId?: string;
  tournamentId?: string;
  concept?: string;
  amount: number;
  date?: string;
  method?: string;
  status: "Pendiente" | "Pagado" | "Vencido";
}

// Extend as needed for other entities...

export interface StoreContextType {
  // Data arrays
  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
  hotels: Hotel[];
  transport: Transport[];
  payments: Payment[];
  // CRUD actions for players:
  addPlayer: (p: Omit<Player, "id">) => void;
  updatePlayer: (p: Player) => void;
  deletePlayer: (id: string) => void;
  // CRUD actions for payments (admin):
  addPayment: (p: Omit<Payment, "id">) => void;
  updatePayment: (p: Payment) => void;
  deletePayment: (id: string) => void;
  // CRUD actions for transport (admin):
  addTransport: (t: Omit<Transport, "id">) => void;
  updateTransport: (t: Transport) => void;
  deleteTransport: (id: string) => void;
  // (If needed, could add for teams and tournaments, or a refresh function)
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  // Local state for demo mode – in a real app, these would be fetched from the DB
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [transport, setTransport] = useState<Transport[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  // Players CRUD:
  const addPlayer = (p: Omit<Player, "id">) => {
    const id = crypto.randomUUID();
    setPlayers(prev => [...prev, { ...p, id }]);
  };
  const updatePlayer = (updated: Player) => {
    setPlayers(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };
  const deletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  // Payments CRUD (admin demo):
  const addPayment = (p: Omit<Payment, "id">) => {
    const id = crypto.randomUUID();
    setPayments(prev => [...prev, { ...p, id }]);
  };
  const updatePayment = (updated: Payment) => {
    setPayments(prev => prev.map(pay => pay.id === updated.id ? updated : pay));
  };
  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(pay => pay.id !== id));
  };

  // Transport CRUD (admin demo):
  const addTransport = (t: Omit<Transport, "id">) => {
    const id = crypto.randomUUID();
    setTransport(prev => [...prev, { ...t, id }]);
  };
  const updateTransport = (updated: Transport) => {
    setTransport(prev => prev.map(tr => tr.id === updated.id ? updated : tr));
  };
  const deleteTransport = (id: string) => {
    setTransport(prev => prev.filter(tr => tr.id !== id));
  };

  const value: StoreContextType = useMemo(() => ({
      tournaments,
      teams,
      players,
      hotels,
      transport,
      payments,
      addPlayer,
      updatePlayer,
      deletePlayer,
      addPayment,
      updatePayment,
      deletePayment,
      addTransport,
      updateTransport,
      deleteTransport,
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
