import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// 👇 YA NO guarda usuarios,
// solo gestiona datos del dashboard.
interface User {
  username: string;
}

interface StoreContextType {
  user: User | null;
  setUser: (u: User | null) => void;

  tournaments: any[];
  teams: any[];
  players: any[];
  hotels: any[];
  transport: any[];
  payments: any[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const [tournaments] = useState<any[]>([]);
  const [teams] = useState<any[]>([]);
  const [players] = useState<any[]>([]);
  const [hotels] = useState<any[]>([]);
  const [transport] = useState<any[]>([]);
  const [payments] = useState<any[]>([]);

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        tournaments,
        teams,
        players,
        hotels,
        transport,
        payments,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
};
