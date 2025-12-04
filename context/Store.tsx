import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Interfaces ---

export interface Tournament {
  id: string;
  name: string;
  dates: string;
  city: string;
  hotelId?: string;
  transportId?: string;
  status: 'Planificado' | 'En curso' | 'Finalizado' | 'Urgente';
}

export interface Team {
  id: string;
  name: string;
  tournamentId: string;
  category: string;
  password?: string; // Credentials for Team Portal
}

export interface Player {
  id: string;
  name: string;
  surname: string;
  teamId: string;
  dni: string; // Simulated path or number
  birthDate: string;
  status: 'Pendiente' | 'Validado';
}

export interface Hotel {
  id: string;
  name: string;
  totalRooms: number;
  occupiedRooms: number;
  city: string;
  status: 'Confirmado' | 'Pendiente';
  image?: string;
}

export interface Transport {
  id: string;
  company: string;
  seats: number;
  departureTime: string;
  departureCity: string;
  status: 'OK' | 'Pendiente' | 'Retrasado';
  type: 'Bus' | 'Avión' | 'Tren';
}

export interface Payment {
  id: string;
  concept: string;
  tournamentId: string;
  amount: number;
  date: string;
  method: string;
  status: 'Pagado' | 'Pendiente' | 'Vencido';
}

interface User {
  username: string;
  role: 'admin' | 'team';
  teamId?: string; // Only for team users
}

interface StoreContextType {
  user: User | null;
  login: (u: string, p: string, type: 'admin' | 'team') => boolean;
  logout: () => void;
  
  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
  hotels: Hotel[];
  transport: Transport[];
  payments: Payment[];

  addTournament: (t: Omit<Tournament, 'id'>) => void;
  updateTournament: (t: Tournament) => void;
  deleteTournament: (id: string) => void;

  addTeam: (t: Omit<Team, 'id'>) => void;
  updateTeam: (t: Team) => void;
  deleteTeam: (id: string) => void;

  addPlayer: (p: Omit<Player, 'id'>) => void;
  updatePlayer: (p: Player) => void;
  deletePlayer: (id: string) => void;

  addHotel: (h: Omit<Hotel, 'id'>) => void;
  updateHotel: (h: Hotel) => void;
  deleteHotel: (id: string) => void;

  addTransport: (t: Omit<Transport, 'id'>) => void;
  updateTransport: (t: Transport) => void;
  deleteTransport: (id: string) => void;

  addPayment: (p: Omit<Payment, 'id'>) => void;
  updatePayment: (p: Payment) => void;
  deletePayment: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// --- Mock Data ---

const INITIAL_TOURNAMENTS: Tournament[] = [
  { id: '1', name: 'Donosti Cup 2024', dates: '2024-07-02', city: 'San Sebastián', hotelId: '1', transportId: '1', status: 'En curso' },
  { id: '2', name: 'Maspalomas Cup', dates: '2024-06-15', city: 'Gran Canaria', hotelId: '2', status: 'Finalizado' },
  { id: '3', name: 'Valencia Soccer Cup', dates: '2024-08-10', city: 'Valencia', hotelId: '4', status: 'Urgente' },
];

const INITIAL_TEAMS: Team[] = [
  { id: '101', name: 'CD Rayo Sub-16', tournamentId: '1', category: 'Sub-16', password: '123' },
  { id: '102', name: 'CD Rayo Sub-14', tournamentId: '1', category: 'Sub-14', password: '123' },
  { id: '103', name: 'Academia Elite Sub-19', tournamentId: '2', category: 'Sub-19', password: '123' },
];

const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'Marcos', surname: 'Alonso', teamId: '101', dni: '12345678A', birthDate: '2008-05-12', status: 'Validado' },
  { id: '2', name: 'Iker', surname: 'Casillas', teamId: '101', dni: '87654321B', birthDate: '2008-02-20', status: 'Pendiente' },
  { id: '3', name: 'David', surname: 'Villa', teamId: '102', dni: '11223344C', birthDate: '2010-11-05', status: 'Validado' },
];

const INITIAL_HOTELS: Hotel[] = [
  { id: '1', name: 'NH Collection Aranzazu', city: 'San Sebastián', totalRooms: 24, occupiedRooms: 24, status: 'Confirmado', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
  { id: '2', name: 'Riu Palace Oasis', city: 'Maspalomas', totalRooms: 15, occupiedRooms: 12, status: 'Confirmado', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
  { id: '3', name: 'Eurostars Madrid Tower', city: 'Madrid', totalRooms: 20, occupiedRooms: 0, status: 'Pendiente', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
  { id: '4', name: 'Sercotel Sorolla Palace', city: 'Valencia', totalRooms: 30, occupiedRooms: 30, status: 'Confirmado', image: 'https://images.unsplash.com/photo-1571896349842-6e53ce41e887?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
];

const INITIAL_TRANSPORT: Transport[] = [
  { id: '1', company: 'Autocares David', seats: 54, departureTime: '08:00', departureCity: 'Madrid', status: 'OK', type: 'Bus' },
  { id: '2', company: 'Iberia IB654', seats: 120, departureTime: '10:30', departureCity: 'Madrid', status: 'OK', type: 'Avión' },
];

const INITIAL_PAYMENTS: Payment[] = [
  { id: '1', concept: 'Inscripción Equipos (50%)', tournamentId: '1', amount: 4200, date: '2024-03-04', method: 'Transferencia', status: 'Pagado' },
  { id: '2', concept: 'Reserva Hotel', tournamentId: '2', amount: 1500, date: '2024-03-02', method: 'Tarjeta', status: 'Pagado' },
  { id: '3', concept: 'Pago Autobuses', tournamentId: '1', amount: 850, date: '2024-02-28', method: 'Pendiente', status: 'Pendiente' },
  { id: '4', concept: 'Fichas Jugadores', tournamentId: '3', amount: 3200, date: '2024-02-25', method: 'Transferencia', status: 'Vencido' },
];

// --- Helper ---
const generateId = () => Math.random().toString(36).substr(2, 9);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- State Initialization ---
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tf_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = localStorage.getItem('tf_tournaments');
    return saved ? JSON.parse(saved) : INITIAL_TOURNAMENTS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('tf_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('tf_players');
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [hotels, setHotels] = useState<Hotel[]>(() => {
    const saved = localStorage.getItem('tf_hotels');
    return saved ? JSON.parse(saved) : INITIAL_HOTELS;
  });

  const [transport, setTransport] = useState<Transport[]>(() => {
    const saved = localStorage.getItem('tf_transport');
    return saved ? JSON.parse(saved) : INITIAL_TRANSPORT;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('tf_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  // --- Persistence ---
  useEffect(() => { localStorage.setItem('tf_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('tf_tournaments', JSON.stringify(tournaments)); }, [tournaments]);
  useEffect(() => { localStorage.setItem('tf_teams', JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem('tf_players', JSON.stringify(players)); }, [players]);
  useEffect(() => { localStorage.setItem('tf_hotels', JSON.stringify(hotels)); }, [hotels]);
  useEffect(() => { localStorage.setItem('tf_transport', JSON.stringify(transport)); }, [transport]);
  useEffect(() => { localStorage.setItem('tf_payments', JSON.stringify(payments)); }, [payments]);

  // --- Actions ---

  const login = (u: string, p: string, type: 'admin' | 'team') => {
    if (type === 'admin') {
      if (u === 'admin' && p === 'admin') {
        setUser({ username: 'Administrator', role: 'admin' });
        return true;
      }
    } else {
      // Team Login logic
      const team = teams.find(t => t.id === u && t.password === p);
      if (team) {
        setUser({ username: team.name, role: 'team', teamId: team.id });
        return true;
      }
    }
    return false;
  };

  const logout = () => {
      localStorage.removeItem('tf_user');
      setUser(null);
  };

  // Generic CRUD Helpers
  const create = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, item: Omit<T, 'id'>) => {
    setter(prev => [...prev, { ...item, id: generateId() } as unknown as T]);
  };
  const update = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, item: T) => {
    setter(prev => prev.map(i => i.id === item.id ? item : i));
  };
  const remove = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: string) => {
    setter(prev => prev.filter(i => i.id !== id));
  };

  return (
    <StoreContext.Provider value={{
      user, login, logout,
      tournaments, addTournament: (i) => create(setTournaments, i), updateTournament: (i) => update(setTournaments, i), deleteTournament: (id) => remove(setTournaments, id),
      teams, addTeam: (i) => create(setTeams, i), updateTeam: (i) => update(setTeams, i), deleteTeam: (id) => remove(setTeams, id),
      players, addPlayer: (i) => create(setPlayers, i), updatePlayer: (i) => update(setPlayers, i), deletePlayer: (id) => remove(setPlayers, id),
      hotels, addHotel: (i) => create(setHotels, i), updateHotel: (i) => update(setHotels, i), deleteHotel: (id) => remove(setHotels, id),
      transport, addTransport: (i) => create(setTransport, i), updateTransport: (i) => update(setTransport, i), deleteTransport: (id) => remove(setTransport, id),
      payments, addPayment: (i) => create(setPayments, i), updatePayment: (i) => update(setPayments, i), deletePayment: (id) => remove(setPayments, id),
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};