// FILE: src/layouts/PortalLayout.tsx
import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

type Portal = "team" | "admin" | "family";

type LinkItem = {
  to: string;
  label: string;
  icon?: string;
  end?: boolean;
};

function isActivePath(pathname: string, link: LinkItem) {
  if (link.end) return pathname === link.to;
  return pathname === link.to || pathname.startsWith(link.to + "/");
}

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
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div data-portal={portal} className="min-h-screen bg-app bg-noise">
      {/* APP SHELL */}
      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 py-4">
        <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
          {/* ============== SIDEBAR (Desktop) ============== */}
          <aside className="hidden lg:block">
            <div className="tf-card shadow-glow sticky top-4 p-4">
              {/* Brand */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-2xl"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, rgba(var(--accent), .95), rgba(var(--accent2), .35))",
                      boxShadow:
                        "0 0 0 1px rgba(var(--accent), .18), 0 16px 40px rgba(0,0,0,.35)",
                    }}
                  />
                  <div className="leading-tight">
                    <div className="text-[11px] uppercase tracking-widest tf-muted">
                      TEAMFLOW
                    </div>
                    <div className="text-lg font-semibold">Portal</div>
                  </div>
                </div>

                <button className="tf-btn" type="button" title="Tema (próximo paso)">
                  🌙
                </button>
              </div>

              {/* User */}
              <div className="mt-4 rounded-2xl border border-[rgba(255,255,255,.10)] bg-[rgba(255,255,255,.04)] p-3">
                <div className="text-[11px] uppercase tracking-wider tf-muted">
                  Conectado
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: "rgba(var(--accent), .95)",
                      boxShadow: "0 0 0 6px rgba(var(--accent), .14)",
                    }}
                  />
                  <div className="text-sm font-medium truncate">{email || "—"}</div>
                </div>
              </div>

              {/* Nav */}
              <nav className="mt-4 space-y-2">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>
                      [
                        "group relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition",
                        isActive
                          ? "border-[rgba(var(--accent),.30)] bg-[linear-gradient(135deg,rgba(var(--accent),.14),rgba(var(--accent2),.08))]"
                          : "border-[rgba(255,255,255,.08)] bg-[rgba(255,255,255,.03)] hover:bg-[rgba(255,255,255,.05)]",
                      ].join(" ")
                    }
                  >
                    <span className="opacity-90">{l.icon ?? "▦"}</span>
                    <span className="font-semibold">{l.label}</span>
                    <span className="ml-auto opacity-30 group-hover:opacity-50">›</span>

                    {/* Active indicator bar */}
                    <span
                      className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-0"
                      style={{ background: "rgba(var(--accent), .95)" }}
                    />
                  </NavLink>
                ))}
              </nav>

              <div className="mt-4 tf-divider" />

              {/* Actions */}
              <div className="mt-4 grid gap-2">
                <button
                  className="tf-btn tf-btn--accent w-full"
                  onClick={onLogout}
                >
                  Cerrar sesión
                </button>

                <button
                  className="tf-btn tf-btn--ghost w-full"
                  type="button"
                  onClick={() => navigate("/")}
                >
                  Volver a inicio
                </button>
              </div>
            </div>
          </aside>

          {/* ============== MAIN ============== */}
          <main className="min-w-0">
            {/* Topbar (Mobile + Desktop) */}
            <div className="tf-card shadow-glow px-4 sm:px-5 py-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-widest tf-muted">
                  {title}
                </div>
                <div className="text-xl sm:text-2xl font-semibold truncate">
                  {subtitle}
                </div>

                {/* Mobile email */}
                <div className="mt-1 text-xs tf-muted truncate lg:hidden">
                  {email || "—"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="tf-btn hidden sm:inline-flex" type="button">
                  Tema
                </button>
                <button className="tf-btn" type="button" onClick={onLogout}>
                  Salir
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="mt-5 pb-24 lg:pb-0">
              {children ?? <Outlet />}
            </div>
          </main>
        </div>
      </div>

      {/* ============== BOTTOM NAV (Mobile) ============== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-[1400px] px-3 pb-3">
          <div className="tf-card shadow-glow px-2 py-2">
            <div className="grid grid-cols-2 gap-2">
              {links.slice(0, 4).map((l) => {
                const active = isActivePath(location.pathname, l);
                return (
                  <button
                    key={l.to}
                    onClick={() => navigate(l.to)}
                    className={[
                      "flex items-center justify-center gap-2 rounded-2xl px-3 py-3 border text-sm font-semibold transition",
                      active
                        ? "border-[rgba(var(--accent),.35)] bg-[linear-gradient(135deg,rgba(var(--accent),.18),rgba(var(--accent2),.10))]"
                        : "border-[rgba(255,255,255,.10)] bg-[rgba(255,255,255,.04)]",
                    ].join(" ")}
                  >
                    <span className="opacity-90">{l.icon ?? "▦"}</span>
                    <span>{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
