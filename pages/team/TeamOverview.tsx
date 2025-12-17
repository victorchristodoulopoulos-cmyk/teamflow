import React, { useEffect, useState } from "react";
import { getPlayersByTeam } from "../../supabase/playersService";
import { getTournamentByTeam } from "../../supabase/teamTournamentService";


interface TeamUser {
  team_id: string;
  email: string;
}

const TeamOverview: React.FC = () => {
  const [teamUser, setTeamUser] = useState<TeamUser | null>(null);
  const [playersCount, setPlayersCount] = useState(0);
  const [validatedDocs, setValidatedDocs] = useState(0);
  const [tournament, setTournament] = useState<any>(null);
  const [hotelsCount, setHotelsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("team_user");
    if (!raw) return;

    setTeamUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    if (!teamUser) return;

    const loadData = async () => {
      try {
        const players = await getPlayersByTeam(teamUser.team_id);
        setPlayersCount(players.length);
        setValidatedDocs(players.filter(p => p.status === "VALIDATED").length);

        const tournamentData = await getTournamentByTeam(teamUser.team_id);
        setTournament(tournamentData);

        
      } catch (err) {
        console.error("Team overview error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [teamUser]);

  if (loading) {
    return <p className="text-slate-400">Cargando dashboard…</p>;
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard del equipo</h1>
        <p className="text-slate-400">
          Acceso como <span className="text-brand-neon">{teamUser?.email}</span>
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Jugadores" value={playersCount} />
        <KpiCard title="Docs validados" value={`${validatedDocs}`} />
        <KpiCard title="Hoteles asignados" value={hotelsCount} />
        <KpiCard
          title="Torneo"
          value={tournament ? tournament.nombre : "—"}
        />
      </div>

      {/* TORNEO */}
      {tournament && (
        <div className="bg-brand-surface p-6 rounded-xl border border-white/10">
          <h2 className="text-lg font-semibold mb-2">Torneo</h2>
          <p className="text-slate-300">{tournament.nombre}</p>
          <p className="text-slate-500 text-sm">
            {tournament.ciudad} · {tournament.fecha}
          </p>
        </div>
      )}
    </div>
  );
};

const KpiCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => (
  <div className="bg-brand-surface p-5 rounded-xl border border-white/10">
    <p className="text-sm text-slate-400">{title}</p>
    <p className="text-3xl font-bold text-white">{value}</p>
  </div>
);

export default TeamOverview;
