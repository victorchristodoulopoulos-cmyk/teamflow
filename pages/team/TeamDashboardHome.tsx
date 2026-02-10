import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import TeamSelector from "../../components/team/TeamSelector";
import { useTeam } from "../../context/TeamContext";
import { getPlayersForAssignedTeams } from "../../supabase/teamPlayersService";

const TeamDashboardHome = () => {
  const { activeTeam, loading: teamLoading } = useTeam();

  const { data: players = [], isLoading } = useQuery({
    queryKey: ["team-players", activeTeam?.id],
    queryFn: () =>
      activeTeam
        ? getPlayersForAssignedTeams(activeTeam.id)
        : Promise.resolve([]),
    enabled: !!activeTeam,
  });

  const stats = useMemo(() => {
    const inscritos = players.filter((p) => p.status === "inscrito" || p.status === "Inscrito").length;
    const pendientes = players.filter((p) => p.status === "pendiente" || p.status === "Pendiente").length;
    const total = players.length;
    const pct = total ? Math.round((inscritos / total) * 100) : 0;

    return { inscritos, pendientes, total, pct };
  }, [players]);

  if (teamLoading) return <p className="tf-muted">Cargando equipos...</p>;

  if (!activeTeam) {
    return <p className="tf-muted">No tienes equipos asignados actualmente.</p>;
  }

  const preview = players.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            {activeTeam.nombre}
          </h1>

          <span className="tf-chip">
            <span className="opacity-80">👤</span> Entrenador
          </span>

          <span className="tf-chip">
            <span className="opacity-80">🏷️</span> Team
          </span>
        </div>

        <div className="tf-muted">
          Torneo:{" "}
          <span className="text-white font-semibold">
            {activeTeam.torneo?.nombre ?? "—"}
          </span>
          {activeTeam.torneo?.ciudad ? (
            <span className="tf-muted"> · {activeTeam.torneo.ciudad}</span>
          ) : null}
        </div>
      </div>

      {/* SELECTOR */}
      <div className="tf-card p-5">
        <div className="text-[11px] uppercase tracking-wider tf-muted mb-2">
          Equipo activo
        </div>
        <TeamSelector />
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-4 tf-card p-5">
          <div className="text-[11px] uppercase tracking-wider tf-muted">
            Jugadores
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-4xl font-semibold">{stats.total}</div>
            <div className="tf-muted text-sm">
              {stats.inscritos} inscritos · {stats.pendientes} pendientes
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 tf-card p-5">
          <div className="text-[11px] uppercase tracking-wider tf-muted">
            Documentación validada
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-4xl font-semibold" style={{ color: "var(--accent2)" }}>
              {stats.pct}%
            </div>
            <div className="tf-muted text-sm">ratio inscritos/total</div>
          </div>

          <div className="mt-4 h-2 rounded-full bg-[rgba(255,255,255,.08)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${stats.pct}%`,
                background: "linear-gradient(90deg, var(--accent), var(--accent2))",
              }}
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 tf-card p-5">
          <div className="text-[11px] uppercase tracking-wider tf-muted">
            Equipo activo
          </div>
          <div className="mt-2 text-2xl font-semibold">{activeTeam.nombre}</div>
          <div className="tf-muted mt-1">{activeTeam.torneo?.nombre ?? "—"}</div>
        </div>
      </div>

      {/* PLAYERS PREVIEW */}
      <div className="tf-card p-5">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Jugadores</div>

          <a
            href="/team-dashboard/jugadores"
            className="tf-btn"
            style={{ textDecoration: "none" }}
          >
            Ver todos →
          </a>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <p className="tf-muted">Cargando jugadores...</p>
          ) : players.length === 0 ? (
            <p className="tf-muted">No hay jugadores asignados.</p>
          ) : (
            <div className="space-y-3">
              {preview.map((p) => {
                const ok = (p.status ?? "").toLowerCase() === "inscrito";
                const badgeClass = ok ? "tf-badge tf-badge--ok" : "tf-badge tf-badge--warn";
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl border border-[rgba(255,255,255,.10)] bg-[rgba(255,255,255,.04)] px-4 py-3"
                  >
                    <div className="font-medium">
                      {p.name} {p.surname ?? ""}
                    </div>
                    <span className={badgeClass}>
                      {ok ? "inscrito" : "pendiente"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDashboardHome;
