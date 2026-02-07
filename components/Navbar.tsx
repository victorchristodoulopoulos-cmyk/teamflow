// src/components/Navbar.tsx
import React, { useEffect, useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "./branding/Logo";

const sections = [
  { name: "Servicios", id: "servicios" },
  { name: "Cómo funciona", id: "como-funciona" },
  { name: "Beneficios", id: "beneficios" },
  { name: "Precios", id: "precios" },
  { name: "Contacto", id: "contacto" },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        isScrolled
          ? "bg-brand-deep/90 backdrop-blur border-b border-white/10 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/">
          <Logo />
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => goToSection(s.id)}
              className="text-sm font-bold uppercase text-white/70 hover:text-white"
            >
              {s.name}
            </button>
          ))}

          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <Link
              to="/login"
              className="flex items-center gap-2 text-white font-bold"
            >
              <LogIn size={16} /> LOGIN
            </Link>
          </div>
        </div>

        {/* Mobile */}
        <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 bg-brand-deep z-40 flex flex-col items-center justify-center gap-8">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => goToSection(s.id)}
              className="text-2xl font-black text-white"
            >
              {s.name}
            </button>
          ))}
          <Link to="/login" className="text-xl text-brand-neon font-bold">
            ACCESS PORTAL
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
