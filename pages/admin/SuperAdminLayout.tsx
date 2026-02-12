import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { Shield, Trophy, DollarSign, LayoutDashboard, LogOut, Menu, X, Users2 } from "lucide-react";

export default function SuperAdminLayout() {
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Estado para móvil
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkGodMode = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate("/login");

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'super_admin') return navigate("/"); 
      setLoading(false);
    };
    checkGodMode();
  }, [navigate]);

  const navItems = [
    { to: "/admin/dashboard", icon: <LayoutDashboard size={20}/>, label: "Dashboard" },
    { to: "/admin/clubs", icon: <Shield size={20}/>, label: "Gestión Clubes" },
    { to: "/admin/equipos", icon: <Users2 size={20}/>, label: "Equipos" },
    { to: "/admin/tournaments", icon: <Trophy size={20}/>, label: "Torneos Globales" },
    { to: "/admin/finance", icon: <DollarSign size={20}/>, label: "Facturación" },
  ];

  if (loading) return <div className="h-screen bg-[#0a0f18] flex items-center justify-center text-brand-neon animate-pulse font-black uppercase tracking-widest">Verificando...</div>;

  return (
    <div className="flex h-screen bg-[#0a0f18] text-white overflow-hidden font-sans">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-white/5 flex items-center justify-between px-6 z-50">
        <span className="text-xl font-black italic tracking-tighter">TEAMFLOW</span>
        <button onClick={() => setSidebarOpen(true)} className="text-brand-neon p-2">
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR (Responsive) */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-black border-r border-white/5 flex flex-col transition-transform duration-300 transform
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `}>
        <div className="p-10 flex items-center justify-between">
            <Link to="/" className="block">
              <span className="text-2xl font-black italic tracking-tighter">TEAMFLOW</span>
              <span className="block text-[9px] font-black uppercase tracking-[0.4em] text-red-600 mt-1">Master Admin</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
              <X size={20} />
            </button>
        </div>
        
        <nav className="flex-1 px-6 space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.to}
                to={item.to} 
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-[0.15em] ${
                  location.pathname === item.to 
                  ? "bg-brand-neon text-black shadow-[0_10px_30px_rgba(var(--brand-neon),0.3)]" 
                  : "text-slate-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
        </nav>

        <div className="p-8 border-t border-white/5 mt-auto">
            <button 
              onClick={() => supabase.auth.signOut().then(() => navigate('/'))}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/5 text-slate-400 hover:text-red-500 transition-all text-xs font-black uppercase tracking-widest"
            >
                <LogOut size={14} /> Desconexión
            </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE */}
      {isSidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden" />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto pt-20 lg:pt-0 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-neon/5 blur-[150px] -z-10 rounded-full"></div>
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
}