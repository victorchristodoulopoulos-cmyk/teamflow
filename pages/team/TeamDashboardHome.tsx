// src/pages/team/TeamDashboardHome.tsx
import React, { useEffect, useState } from "react";

interface TeamUser {
  id: string;
  email: string;
  team_id: string;
}

const TeamDashboardHome: React.FC = () => {
  const [teamUser, setTeamUser] = useState<TeamUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("team_user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setTeamUser(parsed);
      } catch (err) {
        console.error("Error parseando team_user:", err);
        setTeamUser(null);
      }
    }
  }, []);

  if (!teamUser) {
    return (
      <div>
        <h1 className="text-3xl font-display font-bold mb-4">Bienvenido</h1>
        <p className="text-red-400">
          No hay usuario de equipo cargado. Entra desde el login con un usuario
          de equipo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-display font-bold mb-2">Bienvenido</h1>
      <p className="text-slate-300">
        Has accedido como{" "}
        <span className="text-brand-neon font-semibold">{teamUser.email}</span>.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="bg-brand-surface border border-white/10 rounded-2xl p-4">
          <h2 className="text-sm text-slate-400 mb-1">Equipo vinculado</h2>
          <p className="text-lg font-semibold truncate">
            ID: <span className="text-brand-neon">{teamUser.team_id}</span>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Más adelante aquí mostraremos el nombre del equipo y torneo.
          </p>
        </div>

        <div className="bg-brand-surface border border-white/10 rounded-2xl p-4">
          <h2 className="text-sm text-slate-400 mb-1">Estado de documentación</h2>
          <p className="text-2xl font-bold">0%</p>
          <p className="text-xs text-slate-500 mt-1">
            Próximamente: fichas subidas / validadas.
          </p>
        </div>

        <div className="bg-brand-surface border border-white/10 rounded-2xl p-4">
          <h2 className="text-sm text-slate-400 mb-1">Próximos pasos</h2>
          <ul className="text-sm list-disc list-inside text-slate-300 space-y-1 mt-1">
            <li>Invitar a las familias al portal.</li>
            <li>Subir documentación de los jugadores.</li>
            <li>Revisar logística de viaje y hotel.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboardHome;
