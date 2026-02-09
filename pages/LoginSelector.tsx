import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserRound, Building2, ArrowRight } from "lucide-react";
import Logo from "../components/branding/Logo";

const LoginSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-deep text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      
      {/* Background glows */}
      <div className="absolute -left-40 top-1/3 w-[520px] h-[520px] bg-brand-neon/20 blur-[130px]" />
      <div className="absolute right-[-200px] top-1/4 w-[520px] h-[520px] bg-purple-600/20 blur-[130px]" />
      <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-500/10 blur-[150px]" />

      {/* Logo */}
      <div className="mb-16 z-10 text-center">
        <Logo />
        <p className="text-sm text-white/60 mt-3">
          Accede a tu portal TeamFlow
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1400px] z-10">
        
        {/* TEAM */}
        <button
          onClick={() => navigate("/login/team")}
          className="group relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 xl:p-12 text-left transition-all hover:border-brand-neon/50 hover:bg-white/[0.05]"
        >
          <div
            className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 text-brand-neon mb-6">
              <Users size={22} />
              <span className="uppercase tracking-[0.3em] text-xs font-bold">
                Portal Operativo
              </span>
            </div>

            <h2 className="text-5xl xl:text-6xl font-black italic mb-6">
              TEAM
            </h2>

            <p className="text-white/70 text-lg xl:text-xl leading-relaxed max-w-md">
              Gestión completa de equipos, categorías, jugadores, torneos,
              logística y pagos. Operativa diaria para entrenadores.
            </p>

            <div className="mt-10 inline-flex items-center gap-3 text-brand-neon font-bold tracking-widest">
              ACCEDER <ArrowRight />
            </div>
          </div>
        </button>

        {/* FAMILY */}
        <button
          onClick={() => navigate("/login/family")}
          className="group relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 xl:p-12 text-left transition-all hover:border-purple-400/50 hover:bg-white/[0.05]"
        >
          <div
            className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1600&q=80)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 text-purple-300 mb-6">
              <UserRound size={22} />
              <span className="uppercase tracking-[0.3em] text-xs font-bold">
                Portal Familiar
              </span>
            </div>

            <h2 className="text-5xl xl:text-6xl font-black italic mb-6">
              FAMILY
            </h2>

            <p className="text-white/70 text-lg xl:text-xl leading-relaxed max-w-md">
              Información clara del torneo, viajes, documentación y estado
              de pagos del jugador. Todo simple y seguro.
            </p>

            <div className="mt-10 inline-flex items-center gap-3 text-purple-300 font-bold tracking-widest">
              ACCEDER <ArrowRight />
            </div>
          </div>
        </button>

        {/* CLUB */}
        <button
          onClick={() => navigate("/login/club")}
          className="group relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 xl:p-12 text-left transition-all hover:border-sky-400/50 hover:bg-white/[0.05]"
        >
          <div
            className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 text-sky-300 mb-6">
              <Building2 size={22} />
              <span className="uppercase tracking-[0.3em] text-xs font-bold">
                Portal Club
              </span>
            </div>

            <h2 className="text-5xl xl:text-6xl font-black italic mb-6">
              CLUB
            </h2>

            <p className="text-white/70 text-lg xl:text-xl leading-relaxed max-w-md">
              Dirección y gestión integral del club. Equipos, jugadores,
              torneos, pagos, documentación y logística desde un único panel.
            </p>

            <div className="mt-10 inline-flex items-center gap-3 text-sky-300 font-bold tracking-widest">
              ACCEDER <ArrowRight />
            </div>
          </div>
        </button>
      </div>

      <footer className="mt-16 text-xs text-white/30 z-10">
        © TeamFlow · Gestión deportiva profesional
      </footer>
    </div>
  );
};

export default LoginSelector;
