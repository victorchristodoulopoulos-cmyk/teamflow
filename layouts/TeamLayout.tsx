import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Map,
  LogOut, 
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useStore } from '../context/Store';
import Logo from '../components/branding/Logo';

const TeamLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'team') {
       navigate('/dashboard'); 
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Resumen', path: '/team/dashboard', icon: LayoutDashboard },
    { name: 'Plantilla & Docs', path: '/team/roster', icon: Users },
    { name: 'Logística', path: '/team/logistics', icon: Map },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-deep text-brand-platinum font-sans flex flex-col md:flex-row">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 fixed h-full bg-brand-deep border-r border-white/10 flex-col z-20">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
           <Logo size="sm" />
        </div>

        {/* Team Profile */}
        <div className="p-6 border-b border-white/5 bg-brand-surface/30">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white mb-4 shadow-lg mx-auto">
                <Shield size={32} />
            </div>
            <div className="text-center">
                <h3 className="font-display font-bold text-white text-lg leading-tight">{user.username}</h3>
                <span className="text-xs text-slate-400 font-mono mt-1 block">ID: {user.teamId}</span>
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/5">
             <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 w-full transition-colors"
            >
                <LogOut size={20} />
                <span className="font-medium text-sm">Cerrar Sesión</span>
            </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-30 bg-brand-deep/90 backdrop-blur-md border-b border-white/10 px-4 h-16 flex items-center justify-between">
           <Logo size="sm" showText={false} />
           <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-white">{user.username}</span>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                    {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
                </button>
           </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-20 bg-brand-deep pt-20 px-6">
              <nav className="space-y-4">
                  {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-bold ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-brand-surface text-slate-400'
                            }`
                        }
                        >
                        <item.icon size={24} />
                        {item.name}
                    </NavLink>
                  ))}
                   <button 
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-bold text-red-400 bg-brand-surface w-full mt-8"
                    >
                        <LogOut size={24} />
                        Salir
                    </button>
              </nav>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen pt-20 md:pt-0 overflow-y-auto relative bg-brand-deep z-10">
         {/* Desktop Header */}
        <header className="hidden md:flex h-20 bg-transparent border-b border-white/5 px-8 items-center justify-between sticky top-0 backdrop-blur-sm z-10">
            <h2 className="text-xl font-bold text-white opacity-80">
                Portal de Equipo
            </h2>
             <div className="flex items-center gap-3 bg-brand-surface/50 px-4 py-2 rounded-full border border-white/5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-300 uppercase">Sistema Online</span>
            </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeamLayout;