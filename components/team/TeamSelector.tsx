import React from "react";
import { useTeam } from "../../context/TeamContext";

const TeamSelector = () => {
  const { teams, activeTeam, setActiveTeamById, loading } = useTeam();

  if (loading) return <div className="tf-muted">Cargando...</div>;
  if (teams.length <= 1) {
    return (
      <div className="tf-muted">
        {activeTeam ? `${activeTeam.nombre} · ${activeTeam.torneo?.nombre ?? "Sin torneo"}` : "—"}
      </div>
    );
  }

  return (
    <select
      value={activeTeam?.id ?? ""}
      onChange={(e) => setActiveTeamById(e.target.value)}
      className="tf-input"
    >
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.nombre} · {team.torneo?.nombre ?? "Sin torneo"}
        </option>
      ))}
    </select>
  );
};

export default TeamSelector;
