import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './branding/Logo';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Servicios', path: '/servicios' },
    { name: 'Cómo funciona', path: '/como-funciona' },
    { name: 'Beneficios', path: '/beneficios' },
    { name: 'Precios', path: '/precios' },
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-brand-deep/90 backdrop-blur-xl border-white/10 py-3 shadow-glass'
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center relative z-50">
        {/* Logo */}
        <Link to="/" className="hover:opacity-90 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
          <Logo />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-bold uppercase tracking-wide transition-all font-display ${
                location.pathname === link.path 
                ? 'text-brand-neon' 
                : 'text-brand-platinum/70 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center gap-4 pl-4 border-l border-white/10 ml-4">
            <Link 
              to="/login"
              className="text-sm font-bold text-white hover:text-brand-neon transition-colors flex items-center gap-2 group"
            >
              <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
              LOGIN
            </Link>
            <Link
              to="/contacto"
              className="px-6 py-2.5 bg-brand-neon text-brand-deep font-display font-extrabold uppercase text-xs tracking-wider rounded skew-x-[-12deg] hover:bg-white hover:scale-105 transition-all shadow-neon"
            >
              <span className="skew-x-[12deg] inline-block">Demo Gratis</span>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white hover:text-brand-neon transition-colors relative z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-brand-deep/98 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-all duration-300 transform ${
          isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-8 text-center p-6 w-full max-w-sm">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-2xl font-black font-display uppercase italic ${location.pathname === link.path ? 'text-brand-neon' : 'text-white'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-white/10 w-full my-4"></div>
          <Link
            to="/login"
            className="text-xl font-bold font-display text-white hover:text-brand-neon flex items-center justify-center gap-2"
             onClick={() => setIsMobileMenuOpen(false)}
          >
            <LogIn size={24} /> ACCESS PORTAL
          </Link>
          <Link
            to="/contacto"
            className="mt-4 w-full py-5 bg-brand-neon text-brand-deep font-black font-display uppercase tracking-wider rounded text-center text-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Solicitar Demo
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;