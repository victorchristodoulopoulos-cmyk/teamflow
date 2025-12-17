import React, { useEffect, useState } from "react";
import { getPlayersByTeam, Player } from "../../supabase/playersService";

const TeamPlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("team_user");
    if (!raw) return;

    const teamUser = JSON.parse(raw);

    getPlayersByTeam(teamUser.team_id)
      .then(setPlayers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400">Cargando jugadores...</p>;

  if (players.length === 0) {
    return <p className="text-slate-400">Este equipo aún no tiene jugadores.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Jugadores</h1>

      <ul className="space-y-2">
        {players.map(player => (
          <li
            key={player.id}
            className="bg-brand-surface border border-white/10 rounded-xl p-4"
          >
            <div className="font-semibold text-white">
              {player.name}
            </div>
            <div className="text-xs text-slate-400">
              DNI: {player.dni ?? "—"} · Estado: {player.status ?? "Pendiente"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamPlayers;
