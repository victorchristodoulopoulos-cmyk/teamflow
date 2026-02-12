// FILE: src/pages/LoginSelector.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserRound, Building2, ArrowRight } from "lucide-react";
import Logo from "../components/branding/Logo";

type PortalCard = {
  key: "team" | "family" | "club";
  title: string;
  kicker: string;
  description: string;
  to: string;
  Icon: React.ElementType;
  // visuals
  imageUrl: string;
  accentRgb: string; // "180 255 60"
  accent2Rgb: string; // "90 180 255"
};

const CARDS: PortalCard[] = [
  {
    key: "team",
    title: "TEAM",
    kicker: "PORTAL OPERATIVO",
    description:
      "Gestión completa de equipos, categorías, jugadores, torneos, logística y pagos. Operativa diaria para entrenadores.",
    to: "/login/team",
    Icon: Users,
    imageUrl:
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80",
    accentRgb: "180 255 60",
    accent2Rgb: "90 180 255",
  },
  {
    key: "family",
    title: "FAMILY",
    kicker: "PORTAL FAMILIAR",
    description:
      "Información clara del torneo, viajes, documentación y estado de pagos del jugador. Todo simple y seguro.",
    to: "/login/family",
    Icon: UserRound,
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    accentRgb: "168 85 247",
    accent2Rgb: "90 180 255",
  },
  {
    key: "club",
    title: "CLUB",
    kicker: "PORTAL CLUB",
    description:
      "Dirección y gestión integral del club. Equipos, jugadores, torneos, pagos, documentación y logística desde un único panel.",
    to: "/login/club",
    Icon: Building2,
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
    accentRgb: "56 189 248",
    accent2Rgb: "34 211 238",
  },
];

function TopRibbon() {
  // “cinta” curva translúcida arriba de cada card
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[92px] overflow-hidden">
      <svg
        viewBox="0 0 1200 240"
        className="absolute -top-10 left-1/2 w-[140%] -translate-x-1/2 opacity-[0.22]"
        aria-hidden="true"
      >
        <path
          d="M0,160 C240,40 420,40 600,110 C780,180 980,200 1200,120 L1200,0 L0,0 Z"
          fill="white"
        />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
    </div>
  );
}

function PortalCardView({ card, onClick }: { card: PortalCard; onClick: () => void }) {
  const { Icon } = card;

  const accent = `rgb(${card.accentRgb})`;
  const accent2 = `rgb(${card.accent2Rgb})`;

  return (
    <button
      onClick={onClick}
      className="group relative w-full flex-1 overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-300
                 hover:border-white/20 hover:bg-white/[0.05] focus:outline-none focus:ring-4 focus:ring-white/10 active:scale-[0.98] md:active:scale-100"
      style={{
        boxShadow: "0 30px 90px -55px rgba(0,0,0,0.85)",
      }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-[0.22] transition-opacity duration-300 group-hover:opacity-[0.28]"
        style={{
          backgroundImage: `url(${card.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/72" />

      {/* Accent glow */}
      <div
        className="absolute -inset-10 opacity-[0.16] blur-[40px] transition-opacity duration-300 group-hover:opacity-[0.24]"
        style={{
          background: `radial-gradient(closest-side, ${accent}, transparent 65%)`,
        }}
      />
      <div
        className="absolute -inset-10 opacity-[0.10] blur-[60px] transition-opacity duration-300 group-hover:opacity-[0.18]"
        style={{
          background: `radial-gradient(closest-side, ${accent2}, transparent 70%)`,
        }}
      />

      <TopRibbon />

      {/* Content */}
      {/* CAMBIOS AQUÍ: items-center text-center (Móvil) | md:items-start md:text-left (PC) */}
      <div className="relative z-10 flex h-full flex-col justify-center p-6 items-center text-center md:items-start md:text-left md:justify-start md:p-10 xl:p-12">
        
        {/* Kicker */}
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]"
            style={{
              boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 18px 40px rgba(0,0,0,0.35)`,
            }}
          >
            <Icon size={18} style={{ color: accent }} />
          </span>

          <div
            className="text-[11px] font-extrabold uppercase tracking-[0.34em]"
            style={{ color: accent }}
          >
            {card.kicker}
          </div>
        </div>

        {/* Title */}
        <div className="mt-4 md:mt-6">
          <h2 className="text-4xl md:text-[56px] leading-[0.95] font-black italic tracking-tight text-white">
            {card.title}
          </h2>
        </div>

        {/* Description (Oculta en movil para ahorrar espacio) */}
        <p className="hidden md:block mt-6 max-w-[520px] text-[15px] md:text-[16px] leading-relaxed text-white/70">
          {card.description}
        </p>

        {/* CTA */}
        <div className="mt-auto pt-4 md:mt-10 md:pt-0 inline-flex items-center gap-3">
          <span
            className="inline-flex items-center gap-3 rounded-full px-6 py-3 text-[12px] font-extrabold tracking-[0.22em] uppercase border"
            style={{
              color: accent,
              borderColor: `rgba(${card.accentRgb}, 0.35)`,
              background: `linear-gradient(135deg, rgba(${card.accentRgb}, 0.14), rgba(${card.accent2Rgb}, 0.06))`,
              boxShadow: `0 0 0 1px rgba(${card.accentRgb}, 0.10), 0 18px 50px rgba(0,0,0,0.45)`,
            }}
          >
            ENTRAR
            <ArrowRight size={16} />
          </span>
        </div>
      </div>

      {/* Edge highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-[34px] ring-1 ring-white/10" />
    </button>
  );
}

const LoginSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] bg-app bg-noise text-white relative overflow-hidden flex flex-col">
      {/* Extra global glows */}
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[520px] bg-[rgba(180,255,60,0.18)] blur-[140px]" />
      <div className="pointer-events-none absolute right-[-220px] top-1/4 h-[560px] w-[560px] bg-[rgba(168,85,247,0.16)] blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[-240px] left-1/2 h-[640px] w-[640px] -translate-x-1/2 bg-[rgba(56,189,248,0.12)] blur-[170px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 flex flex-col px-6 py-6 md:block md:py-16">
        {/* Header */}
        <div className="text-center flex-none mb-6 md:mb-12">
          <div className="inline-flex items-center justify-center scale-90 md:scale-100">
            <Logo />
          </div>
          <p className="mt-2 md:mt-3 text-xs md:text-sm text-white/60">
            Accede a tu portal TeamFlow
          </p>
        </div>

        {/* Cards - CAMBIO AQUÍ: gap-5 (más aire en movil) | md:gap-8 (PC igual) */}
        <div className="flex-1 flex flex-col gap-5 min-h-0 md:grid md:grid-cols-3 md:gap-8 md:h-auto md:block">
          {CARDS.map((c) => (
            <PortalCardView key={c.key} card={c} onClick={() => navigate(c.to)} />
          ))}
        </div>

        {/* Footer */}
        <div className="hidden md:block mt-12 text-center text-xs text-white/30">
          © TeamFlow · Gestión deportiva profesional
        </div>
      </div>
    </div>
  );
};

export default LoginSelector;