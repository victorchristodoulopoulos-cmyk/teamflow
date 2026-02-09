import { useQuery } from "@tanstack/react-query";
import TeamSelector from "../../components/team/TeamSelector";
import { useTeam } from "../../context/TeamContext";
import { getPlayersForAssignedTeams } from "../../supabase/teamPlayersService";

const TeamDashboardHome = () => {
  const { activeTeam, loading: teamLoading } = useTeam();

  console.log("ACTIVE TEAM", activeTeam);

  const { data: players = [] } = useQuery({
    queryKey: ["team-players", activeTeam?.id],
    queryFn: () =>
      activeTeam ? getPlayersForAssignedTeams(activeTeam.id) : Promise.resolve([]),
    enabled: !!activeTeam,
  });

  if (teamLoading) return <p className="text-slate-400">Cargando equipos...</p>;

  if (!activeTeam) {
    return <p className="text-slate-400">No tienes equipos asignados actualmente.</p>;
  }

  const validated = players.filter((p) => (p.status ?? "").toLowerCase() === "inscrito").length;
  const percentage = players.length ? Math.round((validated / players.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">{activeTeam.nombre}</h1>

      <p className="text-slate-400">
        Torneo:{" "}
        <span className="text-white font-semibold">
          {activeTeam.torneo?.nombre ?? "Sin torneo"}
        </span>
      </p>

      <TeamSelector />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-brand-surface p-5 rounded-2xl">
          <h2 className="text-xs uppercase text-slate-400 mb-2">Jugadores</h2>
          <p className="text-3xl font-bold text-white">{players.length}</p>
        </div>

        <div className="bg-brand-surface p-5 rounded-2xl">
          <h2 className="text-xs uppercase text-slate-400 mb-2">Documentación validada</h2>
          <p className="text-3xl font-bold text-brand-neon">{percentage}%</p>
        </div>

        <div className="bg-brand-surface p-5 rounded-2xl">
          <h2 className="text-xs uppercase text-slate-400 mb-2">Equipo</h2>
          <p className="text-xl font-bold text-white">{activeTeam.nombre}</p>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboardHome;
