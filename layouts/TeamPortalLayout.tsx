import React, { useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { Home, Users, Truck, LogOut } from "lucide-react";
import { useTeam } from "../context/TeamContext";

type LinkItem = {
  to: string;
  label: string;
  icon?: ReactNode;
  end?: boolean;
};

export default function TeamPortalLayout({
  links,
  email,
  onLogout,
  children,
}: {
  links: LinkItem[];
  email: string;
  onLogout: () => Promise<void>;
  children?: ReactNode;
}) {
  const { activeTeam, teams } = useTeam();

  const showSelectorHint = useMemo(() => (teams?.length ?? 0) > 1, [teams]);

  return (
    <div data-portal="team" className="min-h-screen bg-app bg-noise">
      {/* ====== APP SHELL ====== */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        <div className="grid grid-cols-12 gap-6 py-6">
          {/* ====== SIDEBAR (Desktop) ====== */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="tf-card p-5 sticky top-6">
              {/* Brand */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs tf-muted tracking-wider uppercase">TeamFlow</div>
                  <div className="text-xl font-semibold leading-tight">Portal TEAM</div>
                </div>

                <div className="h-10 w-10 rounded-2xl bg-white/[0.06] border border-white/10 grid place-items-center">
                  <span className="text-sm">⚡</span>
                </div>
              </div>

              {/* User */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[11px] uppercase tracking-wider tf-muted">Conectado</div>
                <div className="mt-1 text-sm font-medium truncate">{email || "—"}</div>
              </div>

              {/* Team quick */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[11px] uppercase tracking-wider tf-muted">Equipo</div>
                <div className="mt-1 text-sm font-semibold">
                  {activeTeam?.nombre ?? "—"}
                </div>
                <div className="mt-1 text-xs tf-muted">
                  {activeTeam?.torneo?.nombre ?? "Sin torneo"}
                </div>
                {showSelectorHint ? (
                  <div className="mt-2 text-[11px] tf-muted">
                    Tienes varios equipos → usa el selector arriba
                  </div>
                ) : null}
              </div>

              {/* Nav */}
              <nav className="mt-5 space-y-2">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-3 px-4 py-3 rounded-2xl border transition",
                        isActive
                          ? "bg-white/[0.08] border-white/[0.16]"
                          : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]",
                      ].join(" ")
                    }
                  >
                    <span className="opacity-90">{l.icon}</span>
                    <span className="font-semibold">{l.label}</span>
                    <span className="ml-auto opacity-30">›</span>
                  </NavLink>
                ))}
              </nav>

              {/* Actions */}
              <div className="mt-5 grid gap-2">
                <button className="tf-btn tf-btn--accent w-full" onClick={onLogout}>
                  <span className="inline-flex items-center gap-2 justify-center w-full">
                    <LogOut size={16} />
                    Cerrar sesión
                  </span>
                </button>

                <a
                  href="/"
                  className="tf-btn w-full text-center"
                  style={{ textDecoration: "none" }}
                >
                  Volver a inicio
                </a>
              </div>
            </div>
          </aside>

          {/* ====== MAIN ====== */}
          <main className="col-span-12 lg:col-span-9">
            {/* TOPBAR */}
            <div className="tf-card p-5 sticky top-4 z-10">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs tf-muted tracking-wider uppercase">
                    TEAMFLOW / TEAM
                  </div>
                  <div className="text-2xl font-semibold truncate">
                    {activeTeam?.nombre ?? "Portal de equipo"}
                  </div>
                  <div className="text-sm tf-muted mt-1 truncate">
                    {activeTeam?.torneo?.nombre
                      ? `Torneo: ${activeTeam.torneo.nombre}`
                      : "Sin torneo asignado"}
                    {email ? ` · ${email}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="tf-btn" onClick={onLogout}>
                    Salir
                  </button>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="mt-6 pb-24 lg:pb-6">
              {children ?? <Outlet />}
            </div>
          </main>
        </div>
      </div>

      {/* ====== BOTTOM NAV (Mobile) ====== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-[1400px] px-4 pb-4">
          <div className="tf-card px-3 py-3">
            <div className="grid grid-cols-3">
              <MobileTab to="/team-dashboard" label="Home" icon={<Home size={18} />} end />
              <MobileTab to="/team-dashboard/jugadores" label="Jugadores" icon={<Users size={18} />} />
              <MobileTab to="/team-dashboard/logistica" label="Logística" icon={<Truck size={18} />} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileTab({
  to,
  label,
  icon,
  end,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition",
          isActive ? "bg-white/[0.08] border border-white/[0.14]" : "opacity-80",
        ].join(" ")
      }
    >
      {icon}
      <span className="text-[11px] font-semibold">{label}</span>
    </NavLink>
  );
}
