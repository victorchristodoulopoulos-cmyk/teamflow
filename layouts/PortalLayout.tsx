import React from "react";
import { NavLink, Outlet } from "react-router-dom";

type Portal = "team" | "admin" | "family";

type LinkItem = {
  to: string;
  label: string;
  icon?: string;
  end?: boolean;
};

export default function PortalLayout({
  portal,
  title,
  subtitle,
  links,
  getSessionEmail,
  onLogout,
  children,
}: {
  portal: Portal;
  title: string;
  subtitle: string;
  links: LinkItem[];
  getSessionEmail: () => string;
  onLogout: () => Promise<void>;
  children?: React.ReactNode;
}) {
  const email = getSessionEmail?.() ?? "";

  return (
    <div data-portal={portal} className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* SIDEBAR */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="tf-glass p-5 sticky top-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm tf-muted">TEAMFLOW</div>
                  <div className="text-xl font-semibold tracking-tight">
                    Portal
                  </div>
                </div>

                <button className="tf-btn" type="button">
                  🌙
                </button>
              </div>

              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-wider tf-muted">
                  Conectado
                </div>
                <div className="mt-1 text-sm font-medium truncate">
                  {email || "—"}
                </div>
              </div>

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
                          ? "bg-[rgba(255,255,255,.08)] border-[rgba(255,255,255,.14)]"
                          : "bg-[rgba(255,255,255,.04)] border-[rgba(255,255,255,.08)] hover:bg-[rgba(255,255,255,.06)]",
                      ].join(" ")
                    }
                  >
                    <span className="opacity-90">{l.icon ?? "▦"}</span>
                    <span className="font-medium">{l.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="mt-5">
                <button
                  className="tf-btn tf-btn--accent w-full"
                  onClick={onLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <main className="col-span-12 lg:col-span-9">
            {/* TOPBAR */}
            <div className="tf-glass px-6 py-5 flex items-center justify-between">
              <div>
                <div className="text-xs tf-muted">{title}</div>
                <div className="text-2xl font-semibold">{subtitle}</div>
                <div className="text-sm tf-muted mt-1">
                  Conectado: {email || "—"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="tf-btn" type="button">
                  Tema
                </button>
                <button className="tf-btn" type="button" onClick={onLogout}>
                  Salir
                </button>
              </div>
            </div>

            <div className="mt-6">
              {/* Si usas children como wrapper */}
              {children ?? <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
