import React, { useEffect, useState } from "react";
import { getPlayersByTeam, Player } from "../../supabase/playersService";
import { getTournamentByTeam, Tournament } from "../../supabase/teamTournamentService";
import { getTeamsByTournament, TeamCategory } from "../../supabase/teamTeamsService";

interface TeamUser {
  id: string;
  email: string;
  team_id: string;
}

const TeamDashboardHome: React.FC = () => {
  const [teamUser, setTeamUser] = useState<TeamUser | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<TeamCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("team_user");
    if (!raw) return;

    try {
      setTeamUser(JSON.parse(raw));
    } catch (err) {
      console.error("Error parseando team_user:", err);
    }
  }, []);

  useEffect(() => {
    if (!teamUser) return;

    const loadDashboard = async () => {
      try {
        const playersData = await getPlayersByTeam(teamUser.team_id);
        setPlayers(playersData);

        const tournamentData = await getTournamentByTeam(teamUser.team_id);
        setTournament(tournamentData);

        if (tournamentData) {
          const teams = await getTeamsByTournament(tournamentData.uuid);
          setCategories(teams);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [teamUser]);

  if (!teamUser) {
    return (
      <div className="text-red-400">
        No hay usuario de equipo cargado. Accede desde el login.
      </div>
    );
  }

  const validated = players.filter(p => p.status).length;
  const percentage = players.length
    ? Math.round((validated / players.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Bienvenido</h1>
        <p className="text-slate-300">
          Has accedido como{" "}
          <span className="text-brand-neon font-semibold">
            {teamUser.email}
          </span>
        </p>
      </div>

      {tournament && (
        <div className="bg-brand-surface p-5 rounded-xl border border-white/10">
          <h2 className="text-sm text-slate-400 mb-1">Torneo</h2>
          <p className="text-xl font-semibold text-brand-neon">
            {tournament.nombre}
          </p>
          <p className="text-sm text-slate-400">
            {tournament.ciudad} · {tournament.fecha}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-brand-surface p-4 rounded-xl">
          <h2 className="text-sm text-slate-400">Jugadores</h2>
          <p className="text-2xl font-bold">{players.length}</p>
        </div>

        <div className="bg-brand-surface p-4 rounded-xl">
          <h2 className="text-sm text-slate-400">Documentación validada</h2>
          {loading ? <p>Cargando…</p> : <p className="text-2xl font-bold">{percentage}%</p>}
        </div>

        <div className="bg-brand-surface p-4 rounded-xl">
          <h2 className="text-sm text-slate-400">Pendientes</h2>
          <p className="text-2xl font-bold">{players.length - validated}</p>
        </div>
      </div>

      <div className="bg-brand-surface p-5 rounded-xl border border-white/10">
        <h2 className="text-lg font-semibold mb-3">Categorías del club</h2>

        {categories.length === 0 ? (
          <p className="text-slate-400">No hay categorías registradas.</p>
        ) : (
          <ul className="space-y-2">
            {categories.map(team => (
              <li
                key={team.id}
                className="flex items-center justify-between bg-black/20 px-4 py-2 rounded-lg"
              >
                <span>{team.nombre}</span>
                {team.id === teamUser.team_id && (
                  <span className="text-xs text-brand-neon">Tu equipo</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeamDashboardHome;
