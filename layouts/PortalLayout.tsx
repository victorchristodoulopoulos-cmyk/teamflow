import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "../context/Theme";

type Portal = "family" | "team" | "admin";

type LinkItem = { to: string; label: string; icon: React.ReactNode; end?: boolean };

function cx(...s: Array<string | false | undefined | null>) {
  return s.filter(Boolean).join(" ");
}

function SideLink({ to, label, icon, end }: LinkItem) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cx(
          "flex items-center gap-3 px-4 py-3 rounded-2xl transition font-semibold border",
          isActive
            ? "bg-white/10 text-white border-white/10 shadow-soft"
            : "text-white/70 hover:bg-white/6 hover:text-white border-transparent"
        )
      }
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

function MobileTab({ to, label, icon, end }: LinkItem) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cx(
          "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl min-w-[78px] transition",
          isActive ? "bg-white/10 text-white" : "text-white/65 hover:text-white"
        )
      }
    >
      <div className="text-xl leading-none">{icon}</div>
      <div className="text-[11px] font-semibold tracking-tight">{label}</div>
    </NavLink>
  );
}

export default function PortalLayout({
  portal,
  title,
  subtitle,
  links,
  getSessionEmail,
  onLogout,
}: {
  portal: Portal;
  title: string;
  subtitle: string;
  links: LinkItem[];
  getSessionEmail: () => string;
  onLogout?: () => Promise<void> | void;
}) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const email = getSessionEmail();

  const logout = async () => {
    try {
      await onLogout?.();
    } finally {
      // fallback: limpia session app
      localStorage.removeItem("session");
      navigate("/", { replace: true });
    }
  };

  return (
    <div data-portal={portal} className="min-h-screen bg-app bg-noise">
      <div className="min-h-screen w-full relative z-10">
        {/* DESKTOP */}
        <div className="hidden lg:grid lg:grid-cols-[320px_1fr] lg:min-h-screen">
          <aside className="p-6 border-r border-white/10">
            <div className="tf-card">
              <div className="tf-card-inner">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-extrabold tracking-tight">⚡ TEAMFLOW</div>
                    <div className="text-xs tf-muted">{subtitle}</div>
                  </div>

                  <button onClick={toggle} className="tf-pill text-xs">
                    {theme === "dark" ? "🌙" : "☀️"} <span className="tf-muted">Tema</span>
                  </button>
                </div>

                <div className="mt-4 tf-divider" />

                <div className="mt-4">
                  <div className="text-[11px] uppercase tracking-wider tf-muted">Conectado</div>
                  <div className="mt-1 font-semibold truncate">{email || "—"}</div>
                </div>

                <nav className="mt-5 flex flex-col gap-2">
                  {links.map((l) => (
                    <SideLink key={l.to} {...l} />
                  ))}
                </nav>

                <button
                  onClick={logout}
                  className="mt-6 w-full rounded-2xl px-4 py-3 font-bold transition border border-red-500/25 bg-red-500/10 text-red-200 hover:bg-red-500/18"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </aside>

          <section className="p-8">
            {/* Header */}
            <div className="tf-card">
              <div className="tf-card-inner flex items-center justify-between">
                <div>
                  <div className="text-xs tf-muted">{title}</div>
                  <div className="tf-title text-2xl">{subtitle}</div>
                  <div className="text-sm tf-muted mt-1">
                    Conectado: <span className="text-white/85">{email || "—"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={toggle} className="tf-pill">
                    {theme === "dark" ? "🌙" : "☀️"} <span className="text-sm">Tema</span>
                  </button>
                  <button onClick={logout} className="tf-pill">
                    🚪 <span className="text-sm">Salir</span>
                  </button>
                </div>
              </div>
            </div>

            <main className="mt-6">
              <Outlet />
            </main>
          </section>
        </div>

        {/* MOBILE */}
        <div className="lg:hidden">
          {/* Sticky topbar */}
          <header className="sticky top-0 z-40 safe-top">
            <div className="px-4 pt-3">
              <div className="tf-card">
                <div className="tf-card-inner py-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-[11px] tf-muted">{title}</div>
                    <div className="tf-title text-lg truncate">{subtitle}</div>
                    <div className="text-[12px] tf-muted truncate">
                      {email ? `Conectado: ${email}` : "—"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={toggle} className="tf-pill text-xs">
                      {theme === "dark" ? "🌙" : "☀️"}
                    </button>
                    <button onClick={logout} className="tf-pill text-xs">
                      🚪
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 pt-4 pb-28">
            <Outlet />
          </main>

          {/* Bottom nav */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
            <div className="px-4 pb-4">
              <div className="mx-auto max-w-[520px] rounded-[28px] border border-white/10 bg-black/35 backdrop-blur-xl shadow-[0_22px_70px_rgba(0,0,0,0.60)]">
                <div className="px-2 py-2 flex items-center justify-between">
                  {links.map((l) => (
                    <MobileTab key={l.to} {...l} />
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
