import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { 
  Shield, Trophy, DollarSign, LayoutDashboard, LogOut, 
  Menu, X, Users2, Database, Settings, Zap, Map 
} from "lucide-react";

export default function SuperAdminLayout() {
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('offline');
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
      
      // Ping a la base de datos para verificar status
      const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      setDbStatus(error ? 'offline' : 'online');
      
      setLoading(false);
    };
    checkGodMode();
  }, [navigate]);

  const navItems = [
    { to: "/admin/dashboard", icon: <LayoutDashboard size={18}/>, label: "Command Center" },
    { to: "/admin/clubs", icon: <Shield size={18}/>, label: "Entidades & Clubes" },
    { to: "/admin/equipos", icon: <Users2 size={18}/>, label: "Equipos Globales" },
    { to: "/admin/tournaments", icon: <Trophy size={18}/>, label: "Engine Torneos" },
    { to: "/admin/logistica", icon: <Map size={18}/>, label: "Hub Logístico" }, // <--- 🚨 AÑADIDO AQUÍ
    { to: "/admin/finance", icon: <DollarSign size={18}/>, label: "Caja Central" },
    { to: "/admin/settings", icon: <Settings size={18}/>, label: "Config. Sistema" },
  ];

  if (loading) return (
    <div className="h-screen bg-[#060a11] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-brand-neon border-t-transparent rounded-full animate-spin"></div>
      <p className="text-brand-neon font-black uppercase tracking-[0.3em] text-xs animate-pulse">Sincronizando God Mode...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#060a11] text-white overflow-hidden font-sans selection:bg-brand-neon selection:text-black">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
            <Zap size={18} className="text-brand-neon fill-brand-neon" />
            <span className="text-xl font-black italic tracking-tighter">TEAMFLOW</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="text-brand-neon p-2">
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-[#0a0f18] border-r border-white/5 flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `}>
        <div className="p-10 flex items-center justify-between">
            <Link to="/" className="group">
              <div className="flex items-center gap-2">
                <Zap size={22} className="text-brand-neon group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-black italic tracking-tighter">TEAMFLOW</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-red-500 transition-colors">Master Admin</span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
        </div>
        
        <nav className="flex-1 px-6 space-y-1 overflow-y-auto">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-4">Navegación Core</p>
            {navItems.map((item) => (
              <Link 
                key={item.to}
                to={item.to} 
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-[11px] uppercase tracking-[0.1em] group ${
                  location.pathname === item.to 
                  ? "bg-brand-neon text-black shadow-[0_0_40px_rgba(var(--brand-neon-rgb),0.2)]" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={location.pathname === item.to ? "text-black" : "text-brand-neon opacity-50 group-hover:opacity-100 transition-opacity"}>
                    {item.icon}
                </span> 
                {item.label}
              </Link>
            ))}
        </nav>

        {/* DB STATUS FOOTER */}
        <div className="p-6 mx-6 mb-6 rounded-[28px] bg-black/40 border border-white/5">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Database size={14} className="text-slate-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Node Status</span>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            </div>
            <p className="text-[11px] font-bold text-white mb-4">Supabase EU-West-1</p>
            <button 
              onClick={() => supabase.auth.signOut().then(() => navigate('/'))}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
            >
                <LogOut size={12} /> Desconexión Total
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto pt-20 lg:pt-0 relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#0a1220] via-[#060a11] to-[#060a11]">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-neon/5 blur-[180px] -z-10 rounded-full opacity-50"></div>
        <div className="p-6 md:p-12 max-w-screen-2xl mx-auto">
           <Outlet />
        </div>
      </main>

      {/* OVERLAY FOR MOBILE */}
      {isSidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[55] lg:hidden animate-in fade-in duration-300" />
      )}
    </div>
  );
}