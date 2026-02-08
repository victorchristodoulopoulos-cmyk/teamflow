import React, { useEffect, useState } from "react";
import { getPlayersByTeam, Player } from "../../supabase/playersService";
import { getTournamentByTeam, Tournament } from "../../supabase/teamTournamentService";

const TeamOverview: React.FC = () => {
  const [teamEmail, setTeamEmail] = useState<string>("");  // coach email for display
  const [playersCount, setPlayersCount] = useState(0);
  const [validatedDocs, setValidatedDocs] = useState(0);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [hotelsCount, setHotelsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionRaw = localStorage.getItem("session");
    if (!sessionRaw) {
      setLoading(false);
      return;
    }
    try {
      const session = JSON.parse(sessionRaw);
      setTeamEmail(session.email ?? "");
      const teamId: string | null = session.teamId;
      if (!teamId) {
        setLoading(false);
        return;
      }
      const loadData = async () => {
        try {
          // Fetch players of this team
          const players = await getPlayersByTeam(teamId);
          setPlayersCount(players.length);
          setValidatedDocs(players.filter(p => (p.status ?? "").toLowerCase() === "validado" || p.status === "Validado").length);
          // Fetch tournament info for this team
          const tournamentData = await getTournamentByTeam(teamId);
          setTournament(tournamentData);
          // (Optional) If we wanted, we could fetch hotels assigned to this team or similar.
          // hotelsCount remains 0 unless such data is fetched.
        } catch (err) {
          console.error("Team overview error:", err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    } catch (e) {
      console.error("Error reading session for team overview:", e);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <p className="text-slate-400">Cargando dashboard…</p>;
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard del equipo</h1>
        <p className="text-slate-400">
          Acceso como <span className="text-brand-neon">{teamEmail || "usuario"}</span>
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Jugadores" value={playersCount} />
        <KpiCard title="Docs validados" value={validatedDocs} />
        <KpiCard title="Hoteles asignados" value={hotelsCount} />
        <KpiCard title="Torneo" value={tournament ? tournament.nombre : "—"} />
      </div>

      {/* TORNEO DETAILS */}
      {tournament && (
        <div className="bg-brand-surface p-6 rounded-xl border border-white/10">
          <h2 className="text-lg font-semibold mb{2}">Torneo</h2>
          <p className="text-slate-300">{tournament.nombre}</p>
          <p className="text-slate-500 text-sm">
            {tournament.ciudad} · {tournament.fecha}
          </p>
        </div>
      )}
    </div>
  );
};

// Reusable KPI card component
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
