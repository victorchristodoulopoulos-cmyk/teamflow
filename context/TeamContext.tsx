import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AssignedTeam, getAssignedTeams } from "../supabase/teamTeamsService";

type TeamContextType = {
  teams: AssignedTeam[];
  activeTeam: AssignedTeam | null;
  setActiveTeamById: (teamId: string) => void;
  loading: boolean;
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const [teams, setTeams] = useState<AssignedTeam[]>([]);
  const [activeTeam, setActiveTeam] = useState<AssignedTeam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAssignedTeams();
        setTeams(data);

        const storedTeamId = localStorage.getItem("activeTeamId");
        const selected =
          data.find((t) => t.id === storedTeamId) ?? data[0] ?? null;

        setActiveTeam(selected);

        if (selected) {
          localStorage.setItem("activeTeamId", selected.id);
        }
      } catch (err) {
        console.error("Error loading teams", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const setActiveTeamById = (teamId: string) => {
    const found = teams.find((t) => t.id === teamId) ?? null;
    setActiveTeam(found);
    if (found) {
      localStorage.setItem("activeTeamId", found.id);
    }
  };

  return (
    <TeamContext.Provider
      value={{ teams, activeTeam, setActiveTeamById, loading }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used inside TeamProvider");
  return ctx;
};
