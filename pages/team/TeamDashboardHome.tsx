import React, { useEffect, useState } from "react";
import { getPlayersByTeam, Player } from "../../supabase/playersService";
import {
  getTournamentByTeam,
  Tournament,
} from "../../supabase/teamTournamentService";
import {
  getTeamsByTournament,
  TeamCategory,
} from "../../supabase/teamTeamsService";

interface SessionData {
  email: string;
  role: "team" | "admin";
  teamId: string | null;
}

const TeamDashboardHome: React.FC = () => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<TeamCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Cargar sesión REAL
  useEffect(() => {
    const raw = localStorage.getItem("session");
    if (!raw) return;

    try {
      setSession(JSON.parse(raw));
    } catch {
      console.error("Error leyendo session");
    }
  }, []);

  // 2️⃣ Cargar datos del dashboard
  useEffect(() => {
    if (!session?.teamId) return;

    const load = async () => {
      try {
        const playersData = await getPlayersByTeam(session.teamId);
        setPlayers(playersData);

        const tournamentData = await getTournamentByTeam(session.teamId);
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

    load();
  }, [session]);

  if (!session) {
    return (
      <div className="text-red-400">
        No hay sesión activa. Accede desde el login.
      </div>
    );
  }

  const validated = players.filter((p) => p.status).length;
  const percentage = players.length
    ? Math.round((validated / players.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Bienvenido
        </h1>
        <p className="text-slate-400">
          Acceso como{" "}
          <span className="text-brand-neon font-semibold">
            {session.email}
          </span>
        </p>
      </div>

      {/* Tournament */}
      {tournament && (
        <div className="bg-brand-surface p-6 rounded-2xl border border-white/10">
          <h2 className="text-xs uppercase tracking-widest text-slate-400">
            Torneo
          </h2>
          <p className="text-2xl font-bold text-brand-neon mt-1">
            {tournament.nombre}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {tournament.ciudad} · {tournament.fecha}
          </p>
        </div>
      )}

      {/* Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-brand-surface p-5 rounded-2xl">
          <h2 className="text-xs uppercase text-slate-400 mb-2">
            Jugadores
          </h2>
          <p className="text-3xl font-bold text-white">
            {players.length}
          </p>
        </div>

        <div className="bg-brand-surface p-5 rounded-2xl">
          <h2 className="text-xs uppercase text-slate-400 mb-2">
            Documentación validada
          </h2>
          {loading ? (
            <p className="text-slate-400">Cargando…</p>
          ) : (
            <p className="text-3xl font-bold text-brand-neon">
              {percentage}%
            </p>
          )}
        </div>

        <div className="bg-brand-surface p-5 rounded-2xl">
          <h2 className="text-xs uppercase text-slate-400 mb-2">
            Pendientes
          </h2>
          <p className="text-3xl font-bold text-white">
            {players.length - validated}
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-brand-surface p-6 rounded-2xl border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">
          Categorías del club
        </h2>

        {categories.length === 0 ? (
          <p className="text-slate-400">
            No hay categorías registradas.
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map((team) => (
              <li
                key={team.id}
                className="flex justify-between items-center px-4 py-3 rounded-xl bg-black/30"
              >
                <span>{team.nombre}</span>
                {team.id === session.teamId && (
                  <span className="text-xs text-brand-neon">
                    Tu equipo
                  </span>
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
