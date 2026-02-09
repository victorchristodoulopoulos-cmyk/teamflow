import { useQuery } from "@tanstack/react-query";
import { getTeamPlayers } from "../../supabase/playersService";

const TeamPlayers = () => {
  const { data = [], isLoading, isFetching, error } = useQuery({
    queryKey: ["team-players"],
    queryFn: getTeamPlayers,
  });

  if (isLoading) {
    return <p className="text-slate-400">Cargando jugadores…</p>;
  }

  if (error) {
    return <p className="text-red-400">Error cargando jugadores</p>;
  }

  if (data.length === 0) {
    return <p className="text-slate-400">No hay jugadores asignados.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Jugadores</h1>
        {isFetching && (
          <span className="text-xs text-slate-500">Actualizando…</span>
        )}
      </div>

      <ul className="space-y-2">
        {data.map((p) => (
          <li
            key={p.id}
            className="bg-brand-surface border border-white/10 rounded-xl p-4"
          >
            <div className="font-semibold text-white">
              {p.name} {p.surname}
            </div>
            <div className="text-xs text-slate-400">
              DNI: {p.dni ?? "—"} · Estado: {p.status ?? "Pendiente"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamPlayers;
