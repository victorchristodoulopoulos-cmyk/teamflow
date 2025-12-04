import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, ShieldCheck, Users, Lock } from 'lucide-react';
import { useStore } from '../context/Store';
import Logo from '../components/branding/Logo';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admin' | 'team'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user } = useStore();

  useEffect(() => {
    if (user) {
        if(user.role === 'team') navigate('/team/dashboard');
        else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password, activeTab);
    if (success) {
      if(activeTab === 'team') navigate('/team/dashboard');
      else navigate('/dashboard');
    } else {
      setError('Credenciales no válidas. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-deep flex relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-noise opacity-30 z-0 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-brand-neon/5 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2 z-0"></div>
      <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-blue-600/5 rounded-full blur-[150px] -translate-x-1/3 translate-y-1/3 z-0"></div>

      {/* Left Panel - Visual (Desktop only) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative z-10 border-r border-white/5 bg-brand-deep/30 backdrop-blur-sm">
        <Logo size="lg" />
        
        <div className="max-w-md">
            <h2 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
                Gestión de élite para <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-neon to-white">campeones.</span>
            </h2>
            <div className="flex gap-4">
                 <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur">
                    <div className="text-2xl font-bold text-brand-neon mb-1">+40h</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Ahorradas por torneo</div>
                 </div>
                 <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur">
                    <div className="text-2xl font-bold text-blue-400 mb-1">100%</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Control Documental</div>
                 </div>
            </div>
        </div>

        <div className="text-sm text-slate-500 font-medium">
            © TeamFlow Sports Logistics System v2.4
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
            
            {/* Mobile Logo */}
            <div className="lg:hidden mb-12 flex justify-center">
                <Logo size="lg" />
            </div>

            <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-neon via-blue-500 to-brand-deep"></div>
                
                <h3 className="text-2xl font-display font-bold text-white mb-2">Acceso al Sistema</h3>
                <p className="text-slate-400 mb-8 text-sm">Selecciona tu perfil para continuar.</p>

                {/* Custom Tabs */}
                <div className="grid grid-cols-2 gap-2 mb-8 bg-brand-deep/60 p-1.5 rounded-xl border border-white/5">
                    <button 
                        onClick={() => { setActiveTab('admin'); setError(''); }} 
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                            activeTab === 'admin' 
                            ? 'bg-brand-surfaceHighlight text-white shadow-lg border border-white/10' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <ShieldCheck size={16} className={activeTab === 'admin' ? 'text-brand-neon' : ''} />
                        ADMIN
                    </button>
                    <button 
                        onClick={() => { setActiveTab('team'); setError(''); }} 
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                            activeTab === 'team' 
                            ? 'bg-brand-surfaceHighlight text-white shadow-lg border border-white/10' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Users size={16} className={activeTab === 'team' ? 'text-blue-400' : ''} />
                        EQUIPO
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                            {activeTab === 'admin' ? 'Usuario Administrador' : 'ID de Equipo'}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-brand-deep/50 border border-white/10 rounded-xl px-4 py-4 pl-11 text-white placeholder-slate-600 focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                                placeholder={activeTab === 'admin' ? "admin" : "Ej: 101"}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                {activeTab === 'admin' ? <ShieldCheck size={18} /> : <Users size={18} />}
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-brand-deep/50 border border-white/10 rounded-xl px-4 py-4 pl-11 text-white placeholder-slate-600 focus:outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all"
                                placeholder="••••••••"
                            />
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 text-red-300 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-pulse">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-brand-neon text-brand-deep font-display font-bold text-lg py-4 rounded-xl hover:bg-white hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 shadow-neon mt-4"
                    >
                        ACCEDER
                        <ArrowRight size={20} />
                    </button>
                </form>

                 <div className="mt-8 text-center border-t border-white/5 pt-6">
                    {activeTab === 'admin' ? (
                       <p className="text-xs text-slate-500 font-mono">Credenciales demo: <span className="text-brand-neon bg-white/5 px-2 py-0.5 rounded">admin</span> / <span className="text-brand-neon bg-white/5 px-2 py-0.5 rounded">admin</span></p>
                    ) : (
                       <p className="text-xs text-slate-500 font-mono">Credenciales demo: <span className="text-brand-neon bg-white/5 px-2 py-0.5 rounded">101</span> / <span className="text-brand-neon bg-white/5 px-2 py-0.5 rounded">123</span></p>
                    )}
                </div>
            </div>
            
             <div className="mt-8 text-center">
                 <button onClick={() => navigate('/')} className="text-sm font-bold text-slate-500 hover:text-white transition-colors">
                     ← Volver al sitio web
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Login;