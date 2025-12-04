import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Search,
  Menu,
  X
} from 'lucide-react';
import { useStore } from '../context/Store';
import Logo from '../components/branding/Logo';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Torneos', path: '/dashboard/tournaments', icon: Trophy },
    { name: 'Equipos', path: '/dashboard/teams', icon: Trophy }, // Using Trophy for Teams as placeholder if Users not imported or use Users
    { name: 'Documentación', path: '/dashboard/documentation', icon: Files },
    { name: 'Hoteles', path: '/dashboard/hotels', icon: Hotel },
    { name: 'Transporte', path: '/dashboard/transport', icon: Bus },
    { name: 'Pagos', path: '/dashboard/payments', icon: CreditCard },
  ];

  const pageTitle = location.pathname.split('/').pop()?.replace('-', ' ') || 'General';

  return (
    <div className="min-h-screen bg-brand-deep text-brand-platinum font-sans flex overflow-hidden selection:bg-brand-neon selection:text-brand-deep">
      
      {/* Background Decor */}
      <div className="fixed inset-0 bg-noise opacity-10 pointer-events-none z-0"></div>
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-brand-neon/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - "Glass Cockpit" */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 flex flex-col border-r border-white/5 bg-brand-surface/95 lg:bg-brand-surface/60 backdrop-blur-xl transition-transform duration-300 ease-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
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

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Menu Principal</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-neon/20 to-transparent text-white border-l-2 border-brand-neon shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon 
                size={20} 
                className={`transition-colors duration-300 ${location.pathname === item.path ? 'text-brand-neon' : 'group-hover:text-white'}`} 
              />
              <span className="font-medium tracking-wide text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-brand-deep/30">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 w-full transition-colors mb-2">
            <Settings size={20} />
            <span className="font-medium text-sm">Configuración</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-white hover:bg-red-500 w-full transition-all group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col relative z-10 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-brand-deep/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-8 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"
                >
                  <Menu size={24} />
                </button>

                <h2 className="text-xl lg:text-2xl font-display font-bold text-white capitalize tracking-tight truncate max-w-[150px] sm:max-w-none">
                    {pageTitle}
                </h2>
                
                <div className="hidden md:flex items-center gap-4">
                  <div className="h-6 w-px bg-white/10 mx-2"></div>
                  <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-neon transition-colors" size={16} />
                      <input 
                          type="text" 
                          placeholder="Buscar..." 
                          className="bg-brand-surface/50 border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-neon/50 focus:bg-brand-surface w-48 lg:w-64 transition-all"
                      />
                  </div>
                </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-neon rounded-full shadow-[0_0_8px_#C9FF2F]"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-3 lg:pl-6 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-white leading-none mb-1">{user?.username}</div>
                        <div className="text-[10px] font-bold text-brand-neon uppercase tracking-wider bg-brand-neon/10 px-1.5 py-0.5 rounded inline-block">Administrator</div>
                    </div>
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr from-brand-neon to-blue-600 p-[2px] shadow-lg flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-brand-deep flex items-center justify-center text-xs lg:text-sm font-bold text-white uppercase">
                            {user?.username.slice(0, 2)}
                        </div>
                    </div>
                </div>
            </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 dashboard-scroll w-full">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Outlet />
            </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;