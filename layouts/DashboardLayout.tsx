import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  Files,
  Hotel,
  Bus,
  CreditCard,
  LogOut,
  Settings,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "../supabase/supabaseClient";
import Logo from "../components/branding/Logo";

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Obtener sesión de Supabase
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (!data.session) navigate("/login");
    };

    getSession();

    // Listener de cambios en auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) navigate("/login");
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
    { name: "Torneos", path: "/dashboard/tournaments", icon: Trophy },
    { name: "Equipos", path: "/dashboard/teams", icon: Trophy },
    { name: "Documentación", path: "/dashboard/documentation", icon: Files },
    { name: "Hoteles", path: "/dashboard/hotels", icon: Hotel },
    { name: "Transporte", path: "/dashboard/transport", icon: Bus },
    { name: "Pagos", path: "/dashboard/payments", icon: CreditCard },
  ];

  const pageTitle =
    location.pathname.split("/").pop()?.replace("-", " ") || "General";

  if (!session) {
    return null; // Evita errores de render
  }

  return (
    <div className="min-h-screen bg-brand-deep text-brand-platinum font-sans flex overflow-hidden">

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 flex flex-col border-r 
        border-white/5 bg-brand-surface/90 backdrop-blur-xl transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/5">
          <Logo size="sm" />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all
                ${
                  isActive
                    ? "bg-brand-neon/20 text-white border-l-2 border-brand-neon"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 w-full">
            <Settings size={20} />
            <span className="font-medium text-sm">Configuración</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-600/20 w-full"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen">

        {/* Header */}
        <header className="h-20 bg-brand-deep/80 backdrop-blur-md border-b border-white/5 px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"
            >
              <Menu size={24} />
            </button>

            <h2 className="text-2xl font-bold capitalize">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-4">
            <Bell size={20} className="text-slate-400" />

            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="text-right">
                <div className="text-sm text-white">
                  {session.user.email}
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-brand-neon text-brand-deep flex items-center justify-center font-bold">
                {session.user.email?.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
