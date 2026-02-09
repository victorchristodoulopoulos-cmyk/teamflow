import React from "react";
import { useTeam } from "../../context/TeamContext";

const TeamSelector = () => {
  const { teams, activeTeam, setActiveTeamById, loading } = useTeam();

  if (loading) return null;
  if (teams.length <= 1) return null;

  return (
    <div className="mb-6 max-w-md">
      <label className="block text-xs uppercase text-slate-400 mb-2">
        Equipo activo
      </label>

      <select
        value={activeTeam?.id ?? ""}
        onChange={(e) => setActiveTeamById(e.target.value)}
        className="bg-brand-surface border border-white/10 rounded-xl px-4 py-3 text-white w-full"
      >
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.nombre} · {team.torneo?.nombre ?? "Sin torneo"}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TeamSelector;
