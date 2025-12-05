// src/layouts/TeamDashboardLayout.tsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const TeamDashboardLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Borramos el usuario de equipo y volvemos al login
    localStorage.removeItem("team_user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-brand-deep text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-surface border-r border-white/10 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10 font-bold">
          TEAMFLOW — <span className="text-brand-neon ml-1">Team</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink
            to="/team-dashboard"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? "bg-brand-neon text-brand-deep" : "hover:bg-white/5"
              }`
            }
          >
            Inicio
          </NavLink>

          <NavLink
            to="/team-players"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? "bg-brand-neon text-brand-deep" : "hover:bg-white/5"
              }`
            }
          >
            Jugadores
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-400 hover:text-white hover:bg-red-500/20 px-3 py-2 rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        <div className="h-16 border-b border-white/10 flex items-center px-6">
          {/* Aquí podría ir el nombre del equipo más adelante */}
          <span className="text-sm text-slate-400">
            Portal de equipo – información en tiempo real
          </span>
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeamDashboardLayout;
