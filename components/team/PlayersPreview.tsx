import React from "react";
import StatusPill from "./StatusPill";
import type { TeamPlayer } from "../../supabase/teamPlayersService";

export default function PlayersPreview({
  players,
  onViewAll,
}: {
  players: TeamPlayer[];
  onViewAll?: () => void;
}) {
  const top = players.slice(0, 6);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)] p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">Jugadores</h3>
        <button
          onClick={onViewAll}
          className="text-sm text-white/70 hover:text-white transition"
          type="button"
        >
          Ver todos →
        </button>
      </div>

      {players.length === 0 ? (
        <p className="mt-4 text-white/55">No hay jugadores asignados.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {top.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-white">
                  {p.name} {p.surname ?? ""}
                </p>
                <p className="text-xs text-white/55">Equipo: {p.team_id}</p>
              </div>
              <StatusPill status={p.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
