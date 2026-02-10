import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTeam } from "../../context/TeamContext";
import { getPlayersForAssignedTeams } from "../../supabase/teamPlayersService";

export default function TeamPlayers() {
  const { activeTeam, loading: teamLoading } = useTeam();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "inscrito" | "pendiente">("all");

  const { data: players = [], isLoading } = useQuery({
    queryKey: ["team-players", activeTeam?.id],
    queryFn: () =>
      activeTeam
        ? getPlayersForAssignedTeams(activeTeam.id)
        : Promise.resolve([]),
    enabled: !!activeTeam,
  });

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return players
      .filter((p) => {
        const status = (p.status ?? "").toLowerCase();
        if (filter !== "all" && status !== filter) return false;
        if (!qq) return true;
        const name = `${p.name} ${p.surname ?? ""}`.toLowerCase();
        return name.includes(qq);
      });
  }, [players, q, filter]);

  if (teamLoading) return <p className="tf-muted">Cargando equipo...</p>;
  if (!activeTeam) return <p className="tf-muted">No tienes equipos asignados.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">Jugadores</h1>
        <div className="tf-muted">
          Equipo: <span className="text-white font-semibold">{activeTeam.nombre}</span>
        </div>
      </div>

      <div className="tf-card p-5">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-7">
            <input
              className="tf-input"
              placeholder="Buscar jugador..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="col-span-12 md:col-span-5 flex gap-2">
            <button
              className={`tf-btn ${filter === "all" ? "tf-btn--accent" : ""}`}
              onClick={() => setFilter("all")}
            >
              Todos
            </button>
            <button
              className={`tf-btn ${filter === "inscrito" ? "tf-btn--accent" : ""}`}
              onClick={() => setFilter("inscrito")}
            >
              Inscritos
            </button>
            <button
              className={`tf-btn ${filter === "pendiente" ? "tf-btn--accent" : ""}`}
              onClick={() => setFilter("pendiente")}
            >
              Pendientes
            </button>
          </div>
        </div>
      </div>

      <div className="tf-card p-5">
        {isLoading ? (
          <p className="tf-muted">Cargando jugadores...</p>
        ) : filtered.length === 0 ? (
          <p className="tf-muted">No hay jugadores con ese filtro.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const status = (p.status ?? "").toLowerCase();
              const ok = status === "inscrito";
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl border border-[rgba(255,255,255,.10)] bg-[rgba(255,255,255,.04)] px-4 py-3"
                >
                  <div>
                    <div className="font-semibold">
                      {p.name} {p.surname ?? ""}
                    </div>
                    <div className="tf-muted text-sm">
                      Equipo ID: <span className="opacity-90">{p.equipo_id}</span>
                    </div>
                  </div>

                  <span className={ok ? "tf-badge tf-badge--ok" : "tf-badge tf-badge--warn"}>
                    {ok ? "inscrito" : "pendiente"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
