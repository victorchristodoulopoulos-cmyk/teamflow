// FILE: src/components/Navbar.tsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react"; // Necesitas instalar lucide-react

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Cambiar el estilo al hacer scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => setIsOpen(false), [location]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${
        scrolled || isOpen 
          ? "backdrop-blur-xl bg-black/60 border-b border-white/10" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl transition-transform group-hover:scale-110">⚡</span>
          <span className="font-black tracking-tighter text-xl text-white italic uppercase">
            TEAM<span className="text-lime-400">FLOW</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-bold uppercase tracking-widest text-white/70">
          <a href="#services" className="hover:text-lime-400 transition-colors">Servicios</a>
          <a href="#how" className="hover:text-lime-400 transition-colors">Cómo funciona</a>
          <a href="#pricing" className="hover:text-lime-400 transition-colors">Precios</a>

          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-lime-400 text-black font-black hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(163,230,53,0.3)]"
          >
            LOGIN <ArrowRight size={16} />
          </Link>
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE NAV OVERLAY */}
      <div 
        className={`md:hidden absolute top-20 left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col p-8 gap-6 text-center">
          <a href="#services" className="text-lg font-bold text-white/80 hover:text-lime-400 uppercase tracking-widest">Servicios</a>
          <a href="#how" className="text-lg font-bold text-white/80 hover:text-lime-400 uppercase tracking-widest">Cómo funciona</a>
          <a href="#pricing" className="text-lg font-bold text-white/80 hover:text-lime-400 uppercase tracking-widest">Precios</a>
          
          <Link
            to="/login"
            className="mt-4 px-6 py-4 rounded-2xl bg-lime-400 text-black font-black text-center shadow-lg"
          >
            ENTRAR AL PORTAL
          </Link>
        </div>
      </div>
    </header>
  );
}